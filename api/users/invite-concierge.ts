import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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
  // Em produção (Vercel), o nome seguro recomendado no projeto é SUPABASE_ADMIN_TOKEN
  const supabaseServiceKey = getEnvVar(
    'SUPABASE_ADMIN_TOKEN',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SERVICE_KEY',
    'VITE_SUPABASE_SERVICE_ROLE_KEY'
  );

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
  // Nome seguro recomendado: APP_URL (ver VARIAVEIS_VERCEL_SEGURAS.md)
  const envUrl = getEnvVar('APP_URL', 'APP_PUBLIC_URL', 'VITE_APP_URL');
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

function conciergeInviteEmailTemplate(userName: string, setPasswordLink: string): string {
  const year = new Date().getFullYear();
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Veredicta</title>
      </head>
      <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;color:#111827;">
        <div style="max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,.08);">
            <div style="padding:24px 24px 8px;text-align:center;">
              <h1 style="margin:0;font-size:20px;color:#111827;">Acesso Concierge</h1>
            </div>

            <div style="padding:16px 24px 24px;">
              <p style="margin:0 0 12px;">Olá <strong>${userName}</strong>,</p>

              <p style="margin:0 0 16px;">
                Seu <strong>Acesso Concierge</strong> à Veredicta está pronto. Para começar, basta definir sua senha:
              </p>

              <div style="text-align:center;margin:22px 0;">
                <a href="${setPasswordLink}"
                   style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">
                  Definir senha e acessar
                </a>
              </div>

              <div style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px;border-radius:8px;margin:16px 0;">
                <strong>Como funciona</strong>
                <ul style="margin:10px 0 0;padding-left:18px;line-height:1.8;">
                  <li>Defina sua senha e faça login</li>
                  <li>Crie sua petição com suas informações e documentos</li>
                  <li>Receba a entrega e aprove quando estiver tudo ok</li>
                </ul>
              </div>

              <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px;border-radius:8px;margin:16px 0;">
                <strong>Importante</strong>
                <ul style="margin:10px 0 0;padding-left:18px;line-height:1.8;">
                  <li>Este link expira em <strong>1 hora</strong></li>
                  <li>Se você não reconhece este convite, ignore este email</li>
                </ul>
              </div>

              <p style="margin:16px 0 0;">
                Suporte: <a href="mailto:contato@veredictajus.com" style="color:#ea580c;">contato@veredictajus.com</a>
              </p>

              <p style="margin:16px 0 0;">
                Atenciosamente,<br /><strong style="color:#ea580c;">Equipe Veredicta</strong>
              </p>
            </div>

            <div style="background:#111827;color:#9ca3af;padding:14px 24px;text-align:center;font-size:12px;">
              © ${year} Veredicta. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
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
    // ⚠️ Não usar upsert/onConflict aqui: alguns schemas não têm UNIQUE(user_id)
    const now = new Date().toISOString();
    const farFuture = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(); // ~10 anos

    // Tentar atualizar assinatura ativa existente do usuário (qualquer plano)
    const { data: updatedRows, error: updateErr } = await supabase
      .from('user_subscriptions')
      .update({
        plan_code: 'concierge',
        status: 'active',
        next_billing_date: farFuture,
        updated_at: now,
      })
      .eq('user_id', firebaseUid)
      .eq('status', 'active')
      .select('id');

    if (updateErr) {
      return res.status(500).json({ error: 'Erro ao ativar concierge', details: updateErr.message });
    }

    // Se não havia assinatura ativa, criar uma nova
    if (!updatedRows || updatedRows.length === 0) {
      const { error: insertErr } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: firebaseUid,
          plan_code: 'concierge',
          status: 'active',
          next_billing_date: farFuture,
          updated_at: now,
        });

      if (insertErr) {
        return res.status(500).json({ error: 'Erro ao ativar concierge', details: insertErr.message });
      }
    }

    // 4) Gerar link de definir senha e converter para rota da app
    const appPublicUrl = getAppPublicUrl();
    const firebaseResetLink = await admin.auth().generatePasswordResetLink(normalizedEmail, {
      url: `${appPublicUrl}/#/auth/reset-password`,
      handleCodeInApp: true,
    });

    const setPasswordLink = buildCustomSetPasswordLink(firebaseResetLink, appPublicUrl);

    // 5) Enviar email bonito via Resend
    // Nome seguro recomendado: RESEND_API_TOKEN (ver VARIAVEIS_VERCEL_SEGURAS.md)
    const resendKey = getEnvVar('RESEND_API_TOKEN', 'RESEND_API_KEY', 'VITE_RESEND_API_KEY', 'VITE_RESEND_API_TOKEN');
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


