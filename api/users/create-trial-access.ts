import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

const FULL_NAME_MAX_LENGTH = 120;
const EMAIL_MAX_LENGTH = 254;

const require = createRequire(import.meta.url);
const LOCAL_JSON_PATH = resolve(process.cwd(), 'src/config/firebaseAdmin.local.json');

type FirebaseAdminCredentials = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

function getEnvVar(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value && String(value).trim() !== '') return String(value);
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

function hasOwn(row: Record<string, any> | null, key: string) {
  return Boolean(row && Object.prototype.hasOwnProperty.call(row, key));
}

function normalizePhone(input: string) {
  const digits = String(input || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return '';
}

function hashValue(raw: string) {
  const salt = process.env.TRIAL_HASH_SALT || 'veredicta-trial-salt';
  return createHash('sha256').update(`${salt}:${raw}`).digest('hex');
}

function hashOtpValue(raw: string) {
  const salt = process.env.TRIAL_OTP_HASH_SALT || process.env.TRIAL_HASH_SALT || 'veredicta-trial-otp-salt';
  return createHash('sha256').update(`${salt}:${raw}`).digest('hex');
}

function extractIp(req: VercelRequest) {
  const xff = String(req.headers?.['x-forwarded-for'] || '');
  const candidate = xff.split(',')[0]?.trim();
  if (candidate) return candidate;
  return String((req as any).ip || (req as any).socket?.remoteAddress || '');
}

async function ensureTrialSecurityTables(supabase: ReturnType<typeof createClient>) {
  const createAttemptSql = `
    CREATE TABLE IF NOT EXISTS public.trial_signup_attempts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz NOT NULL DEFAULT now(),
      ip_hash text NOT NULL,
      email_hash text NOT NULL,
      phone_hash text NOT NULL,
      success boolean NOT NULL DEFAULT false
    );`;
  const createIdentitySql = `
    CREATE TABLE IF NOT EXISTS public.trial_identity_registry (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz NOT NULL DEFAULT now(),
      phone_hash text UNIQUE NOT NULL,
      email_hash text,
      firebase_uid text NOT NULL
    );`;

  try {
    await supabase.rpc('execute_sql', { sql: createAttemptSql } as any);
  } catch {
    // Ambientes sem execute_sql RPC podem ignorar esta etapa.
  }

  try {
    await supabase.rpc('execute_sql', { sql: createIdentitySql } as any);
  } catch {
    // Ambientes sem execute_sql RPC podem ignorar esta etapa.
  }
}

function isMissingRelation(error: any) {
  const msg = String(error?.message || '');
  return error?.code === '42P01' || /relation .* does not exist/i.test(msg);
}

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  ipHash: string,
  emailHash: string,
  phoneHash: string
) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [ipAttempts, emailAttempts, phoneAttempts] = await Promise.all([
    supabase
      .from('trial_signup_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since),
    supabase
      .from('trial_signup_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('email_hash', emailHash)
      .gte('created_at', since),
    supabase
      .from('trial_signup_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('phone_hash', phoneHash)
      .gte('created_at', since),
  ]);

  if (ipAttempts.error || emailAttempts.error || phoneAttempts.error) {
    if (isMissingRelation(ipAttempts.error) || isMissingRelation(emailAttempts.error) || isMissingRelation(phoneAttempts.error)) {
      return false;
    }
    throw ipAttempts.error || emailAttempts.error || phoneAttempts.error;
  }

  const ipCount = Number(ipAttempts.count || 0);
  const emailCount = Number(emailAttempts.count || 0);
  const phoneCount = Number(phoneAttempts.count || 0);
  return ipCount >= 8 || emailCount >= 5 || phoneCount >= 4;
}

async function registerAttempt(
  supabase: ReturnType<typeof createClient>,
  ipHash: string,
  emailHash: string,
  phoneHash: string,
  success: boolean
) {
  const { error } = await supabase.from('trial_signup_attempts').insert({
    ip_hash: ipHash,
    email_hash: emailHash,
    phone_hash: phoneHash,
    success,
  });
  if (error && !isMissingRelation(error)) throw error;
}

async function consumeEmailOtpVerification(
  supabase: ReturnType<typeof createClient>,
  email: string,
  verificationToken: string
) {
  const tokenHash = hashOtpValue(`verify:${verificationToken}`);
  const { data: pendingOtp, error: otpError } = await supabase
    .from('trial_email_otp')
    .select('id, verified_at, used_for_trial')
    .eq('email', email)
    .eq('verification_token_hash', tokenHash)
    .eq('consumed', true)
    .eq('used_for_trial', false)
    .order('verified_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError) {
    if (isMissingRelation(otpError)) {
      return {
        ok: false,
        status: 500,
        error: 'Tabela de OTP não encontrada. Execute trial_email_otp_phase1.sql no Supabase.',
      };
    }
    throw otpError;
  }

  if (!pendingOtp) {
    const { data: usedOtp, error: usedOtpError } = await supabase
      .from('trial_email_otp')
      .select('id')
      .eq('email', email)
      .eq('verification_token_hash', tokenHash)
      .eq('consumed', true)
      .eq('used_for_trial', true)
      .maybeSingle();
    if (usedOtpError && !isMissingRelation(usedOtpError)) throw usedOtpError;
    if (usedOtp?.id) {
      return {
        ok: false,
        status: 409,
        error: 'Este token de verificação já foi utilizado.',
      };
    }
    return {
      ok: false,
      status: 403,
      error: 'Validação de e-mail não encontrada ou expirada.',
    };
  }

  const verifiedAt = new Date(String((pendingOtp as any).verified_at || 0));
  if (Number.isNaN(verifiedAt.getTime()) || Date.now() - verifiedAt.getTime() > 20 * 60 * 1000) {
    return {
      ok: false,
      status: 403,
      error: 'Validação de e-mail expirada. Solicite um novo código.',
    };
  }

  return { ok: true as const, otpId: (pendingOtp as any).id as string };
}

async function consumeSmsOtpVerification(
  supabase: ReturnType<typeof createClient>,
  phoneE164: string,
  verificationToken: string
) {
  const tokenHash = hashOtpValue(`verify:${verificationToken}`);
  const { data: pendingOtp, error: otpError } = await supabase
    .from('trial_sms_otp')
    .select('id, phone_e164, verified_at, used_for_trial')
    .eq('verification_token_hash', tokenHash)
    .eq('consumed', true)
    .eq('used_for_trial', false)
    .order('verified_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError) {
    if (isMissingRelation(otpError)) {
      return {
        ok: false,
        status: 500,
        error: 'Tabela de OTP SMS não encontrada. Execute trial_sms_otp_phase1.sql no Supabase.',
      };
    }
    throw otpError;
  }

  if (!pendingOtp) {
    const { data: usedOtp, error: usedOtpError } = await supabase
      .from('trial_sms_otp')
      .select('id')
      .eq('verification_token_hash', tokenHash)
      .eq('consumed', true)
      .eq('used_for_trial', true)
      .maybeSingle();
    if (usedOtpError && !isMissingRelation(usedOtpError)) throw usedOtpError;
    if (usedOtp?.id) {
      return { ok: false, status: 409, error: 'Este token de SMS já foi utilizado.' };
    }
    return { ok: false, status: 403, error: 'Validação de SMS não encontrada ou expirada.' };
  }

  if (String((pendingOtp as any).phone_e164 || '') !== phoneE164) {
    return { ok: false, status: 403, error: 'Token de SMS não corresponde ao telefone informado.' };
  }

  const verifiedAt = new Date(String((pendingOtp as any).verified_at || 0));
  if (Number.isNaN(verifiedAt.getTime()) || Date.now() - verifiedAt.getTime() > 20 * 60 * 1000) {
    return { ok: false, status: 403, error: 'Validação de SMS expirada. Solicite um novo código.' };
  }

  return { ok: true as const, otpId: (pendingOtp as any).id as string };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const email = String((body as any).email || '').trim().toLowerCase();
    const fullName = String((body as any).full_name || '').trim();
    const phoneInput = String((body as any).phone || '').trim();
    const normalizedPhone = normalizePhone(phoneInput);
    const origin = String((body as any).origin || 'qr_code').trim().toLowerCase();
    const website = String((body as any).website || '').trim();
    const emailOtpToken = String((body as any).email_otp_token || '').trim();

    if (website) {
      return res.status(400).json({ error: 'Solicitação inválida.' });
    }

    if (!email || !fullName || !normalizedPhone || !emailOtpToken) {
      return res
        .status(400)
        .json({ error: 'full_name, email, phone e email_otp_token são obrigatórios' });
    }
    if (fullName.length > FULL_NAME_MAX_LENGTH) {
      return res.status(400).json({ error: `full_name deve ter no máximo ${FULL_NAME_MAX_LENGTH} caracteres` });
    }
    if (email.length > EMAIL_MAX_LENGTH) {
      return res.status(400).json({ error: `email deve ter no máximo ${EMAIL_MAX_LENGTH} caracteres` });
    }

    await ensureFirebaseAdmin();
    const supabase = getSupabaseServiceClient();
    await ensureTrialSecurityTables(supabase);

    const remoteIp = extractIp(req);
    const ipHash = hashValue(remoteIp || 'unknown-ip');
    const emailHash = hashValue(email);
    const phoneHash = hashValue(normalizedPhone);

    const otpVerification = await consumeEmailOtpVerification(supabase, email, emailOtpToken);
    if (!otpVerification.ok) {
      await registerAttempt(supabase, ipHash, emailHash, phoneHash, false);
      return res.status(otpVerification.status).json({ error: otpVerification.error });
    }

    const { error: markEmailUsedError } = await supabase
      .from('trial_email_otp')
      .update({
        used_for_trial: true,
        used_for_trial_at: new Date().toISOString(),
      })
      .eq('id', otpVerification.otpId);
    if (markEmailUsedError) throw markEmailUsedError;

    const rateLimited = await checkRateLimit(supabase, ipHash, emailHash, phoneHash);
    if (rateLimited) {
      await registerAttempt(supabase, ipHash, emailHash, phoneHash, false);
      return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos para tentar novamente.' });
    }

    const [identityByPhone, identityByEmail] = await Promise.all([
      supabase
        .from('trial_identity_registry')
        .select('firebase_uid')
        .eq('phone_hash', phoneHash)
        .maybeSingle(),
      supabase
        .from('trial_identity_registry')
        .select('firebase_uid')
        .eq('email_hash', emailHash)
        .maybeSingle(),
    ]);

    if (identityByPhone.error && !isMissingRelation(identityByPhone.error)) throw identityByPhone.error;
    if (identityByEmail.error && !isMissingRelation(identityByEmail.error)) throw identityByEmail.error;

    if (identityByPhone.data?.firebase_uid) {
      await registerAttempt(supabase, ipHash, emailHash, phoneHash, false);
      return res
        .status(409)
        .json({ error: 'Este telefone já utilizou o acesso de teste. Finalize seu cadastro para continuar.' });
    }

    if (identityByEmail.data?.firebase_uid) {
      await registerAttempt(supabase, ipHash, emailHash, phoneHash, false);
      return res
        .status(409)
        .json({ error: 'Este e-mail já utilizou o acesso de teste. Finalize seu cadastro para continuar.' });
    }

    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      if (userRecord.disabled) {
        await admin.auth().updateUser(userRecord.uid, { disabled: false, displayName: fullName });
        userRecord = await admin.auth().getUser(userRecord.uid);
      }
    } catch (error: any) {
      const code = String(error?.code || '');
      if (!code.includes('auth/user-not-found')) throw error;
      userRecord = await admin.auth().createUser({
        email,
        emailVerified: false,
        disabled: false,
        displayName: fullName,
      });
    }

    const firebaseUid = userRecord.uid;
    const rpcParams = {
      p_firebase_uid: firebaseUid,
      p_email: email,
      p_role: 'client',
      p_full_name: fullName || null,
      p_company_name: null,
      p_cnpj: null,
      p_phone: normalizedPhone || null,
      p_address: null,
    };

    const { error: profileRpcError } = await supabase.rpc('create_or_update_user_profile', rpcParams as any);
    if (profileRpcError) {
      await supabase
        .from('user_profiles')
        .upsert(
          {
            firebase_uid: firebaseUid,
            email,
            role: 'client',
            full_name: fullName || null,
            phone: normalizedPhone || null,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'firebase_uid' }
        );
    }

    const { data: profileRow } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle();

    const profilePatch: Record<string, any> = {
      full_name: fullName,
      phone: normalizedPhone,
      updated_at: new Date().toISOString(),
    };
    if (hasOwn(profileRow as any, 'is_trial')) profilePatch.is_trial = true;
    if (hasOwn(profileRow as any, 'trial_petition_used')) profilePatch.trial_petition_used = false;
    if (hasOwn(profileRow as any, 'regularization_required')) profilePatch.regularization_required = false;
    if (hasOwn(profileRow as any, 'trial_origin')) profilePatch.trial_origin = origin;
    if (hasOwn(profileRow as any, 'trial_started_at')) profilePatch.trial_started_at = new Date().toISOString();

    await supabase.from('user_profiles').update(profilePatch).eq('firebase_uid', firebaseUid);

    const { error: registryInsertError } = await supabase.from('trial_identity_registry').insert({
      phone_hash: phoneHash,
      email_hash: emailHash,
      firebase_uid: firebaseUid,
    });
    if (registryInsertError && !isMissingRelation(registryInsertError)) {
      throw registryInsertError;
    }

    const farFuture = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
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

    await admin.auth().setCustomUserClaims(firebaseUid, { role: 'client', trial: true });
    const customToken = await admin.auth().createCustomToken(firebaseUid, { role: 'client', trial: true });
    await registerAttempt(supabase, ipHash, emailHash, phoneHash, true);

    return res.status(200).json({ success: true, uid: firebaseUid, custom_token: customToken });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao criar acesso trial', details: error?.message || String(error) });
  }
}

