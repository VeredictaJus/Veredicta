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

  // fallback: verify in Supabase profile
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

export const POST: Handler = async (req, res) => {
  try {
    const body = req.body || {};
    const firebase_uid = String(body.firebase_uid || '').trim();
    if (!firebase_uid) {
      return res.status(400).json({ error: 'firebase_uid é obrigatório' });
    }

    await requireAdmin(req);

    const supabase = getSupabaseServiceClient();

    // Ativar/atualizar assinatura concierge
    const farFuture = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(); // ~10 anos
    const { error: upsertErr } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: firebase_uid,
          plan_code: 'concierge',
          status: 'active',
          next_billing_date: farFuture,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (upsertErr) {
      return res.status(500).json({ error: 'Erro ao ativar concierge', details: upsertErr.message });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    const code = String(err?.message || '');
    if (code === 'missing_auth') return res.status(401).json({ error: 'Não autenticado' });
    if (code === 'not_admin') return res.status(403).json({ error: 'Acesso negado' });
    return res.status(500).json({ error: 'Erro ao ativar concierge', details: err?.message || String(err) });
  }
};

export default POST;






