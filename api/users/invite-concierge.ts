import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

import { conciergeInviteEmailTemplate } from '../../src/services/emailTemplates';

const require = createRequire(import.meta.url);
const LOCAL_JSON_PATH = resolve(process.cwd(), 'src/config/firebaseAdmin.local.json');

type FirebaseAdminCredentials = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

function getEnvVar(...names: string[]) {
  for (const n of names) {
    const v = process.env[n];
    if (v && String(v).trim() !== '') return String(v);
  }
  return '';
}

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
  const supabaseUrl = getEnvVar('SUPABASE_URL', 'VITE_SUPABASE_URL');
  const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY', 'VITE_SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service role is not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getBearerToken(req: VercelRequest): string | null {
  const raw = (req.headers.authorization || req.headers.Authorization) as string | undefined;
  if (!raw) return null;
  const match = String(raw).match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

async function requireAdmin(req: VercelRequest) {
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

function getAppPublicUrl(): string {
  const envUrl = getEnvVar('APP_PUBLIC_URL', 'VITE_APP_URL');
  const url = envUrl || 'http://localhost:5176';
  return url.replace(/\/$/, '');
}

function buildCustomSetPasswordLink(firebaseLink: string, appPublicUrl: string): string {
  try {
    const parsed = new URL(firebaseLink);
    const oobCode = parsed.searchParams.get('oobCode');
    const mode = parsed.searchParams.get('mode') || 'resetPassword';
    const lang = parsed.searchParams.get('lang');

    const custom = new URL(`${appPublicUrl}/#/auth/reset-password`);
    if (oobCode) custom.searchParams.set('oobCode', oobCode);
    if (mode) custom.searchParams.set('mode', mode);
    if (lang) custom.searchParams.set('lang', lang);

    return custom.toString();
  } catch {
    return firebaseLink;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, full_name, company_name } = (req.body || {}) as any;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const fullName = String(full_name || '').trim();
    const companyName = String(company_name || '').trim();

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'email é obrigatório' });
    }

    await requireAdmin(req);
    await ensureFirebaseAdmin();

    // 1) Firebase: buscar ou criar usuário por email
    let fbUser: admin.auth.UserRecord;
    try {
      fbUser = await admin.auth().getUserByEmail(normalizedEmail);
    } catch (e: any) {
      const code = String(e?.code || '');
      if (code.includes('auth/user-not-found')) {
        fbUser = await admin.auth().createUser({
          email: normalizedEmail,
          emailVerified: false,
          disabled: false,
          displayName: fullName || companyName || normalizedEmail.split('@')[0],
        });
      } else {
        throw e;
      }
    }

    const firebaseUid = fbUser.uid;

    // 2) Supabase: garantir perfil (client)
    const supabase = getSupabaseServiceClient();
    const rpcParams = {
      p_firebase_uid: firebaseUid,
      p_email: normalizedEmail,
      p_role: 'client',
      p_full_name: fullName || null,
      p_company_name: companyName || null,
      p_cnpj: null,
      p_phone: null,
      p_address: null,
    };

    const { error: profRpcErr } = await supabase.rpc('create_or_update_user_profile', rpcParams as any);
    if (profRpcErr) {
      await supabase
        .from('user_profiles')
        .upsert(
          {
            firebase_uid: firebaseUid,
            email: normalizedEmail,
            role: 'client',
            full_name: fullName || null,
            company_name: companyName || null,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'firebase_uid' }
        );
    }

    // 3) Ativar assinatura concierge
    const farFuture = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString();
    const { error: upsertErr } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: firebaseUid,
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

    // 4) Gerar link de definir senha e converter para rota da app
    const appPublicUrl = getAppPublicUrl();
    const firebaseResetLink = await admin.auth().generatePasswordResetLink(normalizedEmail, {
      url: `${appPublicUrl}/#/auth/reset-password`,
      handleCodeInApp: true,
    });

    const setPasswordLink = buildCustomSetPasswordLink(firebaseResetLink, appPublicUrl);

    // 5) Enviar email bonito via Resend
    const resendKey = getEnvVar('RESEND_API_KEY', 'VITE_RESEND_API_KEY');
    if (!resendKey) {
      return res.status(500).json({ error: 'Email service not configured (RESEND_API_KEY)' });
    }

    const resend = new Resend(resendKey);
    const userName = fullName || companyName || normalizedEmail.split('@')[0];
    const html = conciergeInviteEmailTemplate(userName, setPasswordLink);

    await resend.emails.send({
      from: 'Veredicta - Plataforma de Petições Jurídicas <contato@veredictajus.com>',
      to: [normalizedEmail],
      subject: 'Seu Acesso Concierge à Veredicta — defina sua senha',
      html,
    });

    return res.status(200).json({ success: true, firebase_uid: firebaseUid });
  } catch (err: any) {
    const code = String(err?.message || '');
    if (code === 'missing_auth') return res.status(401).json({ error: 'Não autenticado' });
    if (code === 'not_admin') return res.status(403).json({ error: 'Acesso negado' });
    return res.status(500).json({ error: 'Erro ao convidar concierge', details: err?.message || String(err) });
  }
}


