import type { Handler } from 'vite-plugin-api-routes';
import admin from 'firebase-admin';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const LOCAL_JSON_PATH = resolve(process.cwd(), 'src/config/firebaseAdmin.local.json');

type FirebaseAdminCredentials = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

async function loadFirebaseCredentials(): Promise<FirebaseAdminCredentials> {
  const creds: FirebaseAdminCredentials = {};

  if (existsSync(LOCAL_JSON_PATH)) {
    try {
      const json = require(LOCAL_JSON_PATH);
      creds.projectId = json.project_id || json.projectId || creds.projectId;
      creds.clientEmail = json.client_email || json.clientEmail || creds.clientEmail;
      creds.privateKey = json.private_key || json.privateKey || creds.privateKey;
    } catch {
      // ignore
    }
  }

  if (process.env.FIREBASE_PROJECT_ID) creds.projectId = process.env.FIREBASE_PROJECT_ID;
  if (process.env.FIREBASE_CLIENT_EMAIL) creds.clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (process.env.FIREBASE_PRIVATE_KEY) creds.privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Optional: load from FIREBASE_PRIVATE_KEY_VALUE.txt
  if (!creds.privateKey) {
    try {
      const keyPath = resolve(process.cwd(), 'FIREBASE_PRIVATE_KEY_VALUE.txt');
      if (existsSync(keyPath)) {
        const keyContent = readFileSync(keyPath, 'utf-8').trim();
        creds.privateKey = keyContent.replace(/\\n/g, '\n');
      }
    } catch {
      // ignore
    }
  }

  return creds;
}

let initializing: Promise<void> | null = null;

async function ensureFirebaseAdmin() {
  if (admin.apps.length) return;
  if (initializing) return initializing;

  initializing = (async () => {
    const { projectId, clientEmail, privateKey } = await loadFirebaseCredentials();
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase Admin credentials are not configured');
    }

    const normalizedKey = privateKey
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/^\s+/gm, '')
      .trim();

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: normalizedKey,
      }),
    });
  })();

  return initializing;
}

function getSupabaseServiceClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey =
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service role is not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getBearerToken(req: any): string | null {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

async function requireAdmin(req: any) {
  await ensureFirebaseAdmin();
  const token = getBearerToken(req);
  if (!token) throw new Error('missing_auth');

  const decoded = await admin.auth().verifyIdToken(token);
  const role = String((decoded as any).role || (decoded as any).customClaims?.role || '').toLowerCase();
  if (role === 'admin') return decoded;

  const supabase = getSupabaseServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('firebase_uid', decoded.uid)
    .maybeSingle();

  if (String(profile?.role || '').toLowerCase() !== 'admin') {
    throw new Error('not_admin');
  }

  return decoded;
}

async function requireAdminOrSelf(req: any, targetFirebaseUid: string) {
  await ensureFirebaseAdmin();
  const token = getBearerToken(req);
  if (!token) throw new Error('missing_auth');

  const decoded = await admin.auth().verifyIdToken(token);
  const callerUid = String(decoded.uid || '');

  // Self-service: allow the logged-in user to close their own concierge
  if (callerUid && targetFirebaseUid && callerUid === targetFirebaseUid) {
    return { decoded, mode: 'self' as const };
  }

  // Otherwise must be admin
  await requireAdmin(req);
  return { decoded, mode: 'admin' as const };
}

export const POST: Handler = async (req, res) => {
  try {
    const body = req.body || {};
    const firebase_uid = String(body.firebase_uid || '').trim();
    if (!firebase_uid) {
      return res.status(400).json({ error: 'firebase_uid é obrigatório' });
    }

    await requireAdminOrSelf(req, firebase_uid);

    const supabase = getSupabaseServiceClient();

    // Garantir que é concierge (apenas para concierge)
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('plan_code, status')
      .eq('user_id', firebase_uid)
      .eq('status', 'active')
      .maybeSingle();

    if (String(sub?.plan_code || '').toLowerCase() !== 'concierge') {
      return res.status(403).json({ error: 'Ação permitida apenas para cliente concierge' });
    }

    // Só encerrar após a petição ser concluída (COMPLETED/APPROVED)
    const { data: donePetition, error: donePetitionError } = await supabase
      .from('petitions')
      .select('id, status')
      .eq('client_id', firebase_uid)
      .in('status', ['approved', 'completed', 'APPROVED', 'COMPLETED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (donePetitionError) {
      return res.status(500).json({ error: 'Erro ao verificar status da petição', details: donePetitionError.message });
    }

    if (!donePetition) {
      return res.status(409).json({
        error: 'Concierge só pode ser encerrado após a petição ser concluída.',
      });
    }

    // 1) Desabilitar login no Firebase
    await ensureFirebaseAdmin();
    await admin.auth().updateUser(firebase_uid, { disabled: true });
    // Best-effort: revogar refresh tokens para derrubar a sessão mais rápido
    try {
      await admin.auth().revokeRefreshTokens(firebase_uid);
    } catch {
      // ignore
    }

    // 2) Encerrar assinatura concierge
    await supabase
      .from('user_subscriptions')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('user_id', firebase_uid)
      .eq('plan_code', 'concierge');

    // 3) Anonimizar perfil (mantém histórico)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('firebase_uid', firebase_uid)
      .maybeSingle();

    if (profile) {
      const candidateNullFields = [
        'full_name',
        'company_name',
        'email',
        'phone',
        'cpf',
        'cnpj',
        'address',
        'oab',
        'oab_number',
        'oab_state',
      ];

      const updates: Record<string, any> = {};
      for (const key of candidateNullFields) {
        if (Object.prototype.hasOwnProperty.call(profile, key)) {
          updates[key] = null;
        }
      }

      if (Object.prototype.hasOwnProperty.call(profile, 'is_blocked')) updates.is_blocked = true;
      if (Object.prototype.hasOwnProperty.call(profile, 'status')) updates.status = 'deleted';
      if (Object.prototype.hasOwnProperty.call(profile, 'updated_at')) updates.updated_at = new Date().toISOString();

      if (Object.keys(updates).length > 0) {
        const { error: profErr } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('firebase_uid', firebase_uid);

        if (profErr) {
          return res.status(500).json({ error: 'Falha ao anonimizar perfil', details: profErr.message });
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    const code = String(err?.message || '');
    if (code === 'missing_auth') return res.status(401).json({ error: 'Não autenticado' });
    if (code === 'not_admin') return res.status(403).json({ error: 'Acesso negado' });
    return res.status(500).json({ error: 'Erro ao encerrar concierge', details: err?.message || String(err) });
  }
};

export default POST;


