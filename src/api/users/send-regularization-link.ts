import type { Handler } from 'vite-plugin-api-routes';
import admin from 'firebase-admin';
import { Resend } from 'resend';
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
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

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

  if (String(profile?.role || '').toLowerCase() !== 'admin') throw new Error('not_admin');
  return decoded;
}

async function getResendApiKey(): Promise<string> {
  try {
    const keys = await import('@/config/keys.local');
    const local = (keys as any)?.LOCAL_KEYS?.RESEND_API_KEY;
    if (local) return local;
  } catch {
    // ignore
  }
  return process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';
}

function getAppPublicUrl() {
  const envUrl = process.env.APP_PUBLIC_URL || process.env.VITE_APP_URL || 'http://localhost:5176';
  return String(envUrl).replace(/\/$/, '');
}

function htmlTemplate(name: string, link: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #ea580c;">Finalize seu cadastro para continuar</h2>
      <p>Olá, <strong>${name}</strong>.</p>
      <p>Sua petição de teste já está concluída. Para continuar usando a plataforma, finalize seu cadastro com CPF/CNPJ e escolha um plano.</p>
      <p style="margin: 28px 0;">
        <a href="${link}" style="background: #ea580c; color: #fff; padding: 12px 18px; border-radius: 8px; text-decoration: none;">Entrar e finalizar cadastro</a>
      </p>
      <p>Depois de entrar, acesse <strong>Configurações</strong> para completar os dados e em seguida escolha seu plano.</p>
      <p style="color:#6b7280;font-size:12px;">Se você não solicitou este email, ignore esta mensagem.</p>
    </div>
  `;
}

export const POST: Handler = async (req, res) => {
  try {
    const body = req.body || {};
    const firebaseUid = String(body.firebase_uid || '').trim();
    if (!firebaseUid) return res.status(400).json({ error: 'firebase_uid é obrigatório' });

    await requireAdmin(req);
    await ensureFirebaseAdmin();
    const supabase = getSupabaseServiceClient();

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email, full_name')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle();

    const email = String(profile?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Usuário sem email cadastrado' });
    const fullName = String(profile?.full_name || email.split('@')[0]);

    const appPublicUrl = getAppPublicUrl();
    const firebaseResetLink = await admin.auth().generatePasswordResetLink(email, {
      url: `${appPublicUrl}/#/auth/reset-password`,
      handleCodeInApp: true,
    });

    const resendKey = await getResendApiKey();
    if (!resendKey) return res.status(500).json({ error: 'Email service not configured (RESEND_API_KEY)' });
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: 'Veredicta - Plataforma de Petições Jurídicas <contato@veredictajus.com>',
      to: [email],
      subject: 'Finalize seu cadastro para continuar na Veredicta',
      html: htmlTemplate(fullName, firebaseResetLink),
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    const code = String(error?.message || '');
    if (code === 'missing_auth') return res.status(401).json({ error: 'Não autenticado' });
    if (code === 'not_admin') return res.status(403).json({ error: 'Acesso negado' });
    return res.status(500).json({ error: 'Erro ao enviar link de regularização', details: error?.message || String(error) });
  }
};

export default POST;

