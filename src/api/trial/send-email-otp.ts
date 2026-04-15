import type { Handler } from 'vite-plugin-api-routes';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomInt } from 'node:crypto';

const FULL_NAME_MAX_LENGTH = 120;
const EMAIL_MAX_LENGTH = 254;

function getEnvVar(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value && String(value).trim() !== '') return String(value);
  }
  return '';
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

function getAppPublicUrl() {
  const envUrl = getEnvVar('APP_URL', 'APP_PUBLIC_URL', 'VITE_APP_URL') || 'http://localhost:5176';
  return String(envUrl).replace(/\/$/, '');
}

function extractIp(req: any) {
  const xff = String(req.headers?.['x-forwarded-for'] || req.headers?.['X-Forwarded-For'] || '');
  const candidate = xff.split(',')[0]?.trim();
  if (candidate) return candidate;
  return String(req.ip || req.socket?.remoteAddress || '');
}

function hashValue(raw: string) {
  const salt = process.env.TRIAL_OTP_HASH_SALT || process.env.TRIAL_HASH_SALT || 'veredicta-trial-otp-salt';
  return createHash('sha256').update(`${salt}:${raw}`).digest('hex');
}

function isMissingRelation(error: any) {
  const msg = String(error?.message || '');
  return error?.code === '42P01' || /relation .* does not exist/i.test(msg);
}

async function getResendApiKey(): Promise<string> {
  try {
    const keys = await import('@/config/keys.local');
    const local = (keys as any)?.LOCAL_KEYS?.RESEND_API_KEY;
    if (local) return local;
  } catch {
    // ignore
  }

  return getEnvVar('RESEND_API_TOKEN', 'RESEND_API_KEY', 'VITE_RESEND_API_KEY', 'VITE_RESEND_API_TOKEN');
}

async function verifyTurnstileToken(token: string, remoteIp: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY || '';
  if (!secret) return true;
  if (!token) return false;

  try {
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token);
    if (remoteIp) body.set('remoteip', remoteIp);
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const payload = await response.json().catch(() => ({}));
    return Boolean(payload?.success);
  } catch {
    return false;
  }
}

function buildOtpTemplate(name: string, code: string) {
  const appUrl = getAppPublicUrl();
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #ea580c;">Seu código de verificação</h2>
      <p>Olá, <strong>${name}</strong>.</p>
      <p>Use o código abaixo para validar seu e-mail e iniciar o teste na Veredicta:</p>
      <div style="font-size: 32px; letter-spacing: 6px; font-weight: bold; margin: 16px 0; color: #111827;">
        ${code}
      </div>
      <p>Este código expira em 10 minutos.</p>
      <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">
        Se você não solicitou este código, ignore este e-mail.
      </p>
      <p style="margin-top: 12px; color: #6b7280; font-size: 12px;">
        <a href="${appUrl}" style="color: #6b7280;">${appUrl}</a>
      </p>
    </div>
  `;
}

export const POST: Handler = async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const fullName = String(body.full_name || '').trim();
    const captchaToken = String(body.captcha_token || '').trim();
    const website = String(body.website || '').trim();

    if (website) return res.status(400).json({ error: 'Solicitação inválida.' });
    if (!email || !fullName) {
      return res.status(400).json({ error: 'email e full_name são obrigatórios' });
    }
    if (fullName.length > FULL_NAME_MAX_LENGTH) {
      return res.status(400).json({ error: `full_name deve ter no máximo ${FULL_NAME_MAX_LENGTH} caracteres` });
    }
    if (email.length > EMAIL_MAX_LENGTH) {
      return res.status(400).json({ error: `email deve ter no máximo ${EMAIL_MAX_LENGTH} caracteres` });
    }

    const remoteIp = extractIp(req);
    const captchaOk = await verifyTurnstileToken(captchaToken, remoteIp);
    if (!captchaOk) {
      return res.status(400).json({ error: 'Validação anti-bot inválida. Tente novamente.' });
    }

    const supabase = getSupabaseServiceClient();
    const ipHash = hashValue(`ip:${remoteIp || 'unknown'}`);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const [recentByEmail, recentByIp, cooldownByEmail] = await Promise.all([
      supabase
        .from('trial_email_otp')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .gte('created_at', oneHourAgo),
      supabase
        .from('trial_email_otp')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', oneHourAgo),
      supabase
        .from('trial_email_otp')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .gte('created_at', oneMinuteAgo),
    ]);

    const errors = [recentByEmail.error, recentByIp.error, cooldownByEmail.error].filter(Boolean);
    if (errors.length > 0) {
      const firstError = errors[0] as any;
      if (isMissingRelation(firstError)) {
        return res.status(500).json({
          error: 'Tabela de OTP não encontrada. Execute trial_email_otp_phase1.sql no Supabase.',
        });
      }
      throw firstError;
    }

    if (Number(cooldownByEmail.count || 0) > 0) {
      return res.status(429).json({ error: 'Aguarde 60 segundos para reenviar o código.' });
    }
    if (Number(recentByEmail.count || 0) >= 6 || Number(recentByIp.count || 0) >= 15) {
      return res.status(429).json({ error: 'Limite de tentativas atingido. Tente novamente mais tarde.' });
    }

    const otpCode = String(randomInt(0, 1000000)).padStart(6, '0');
    const codeHash = hashValue(`otp:${email}:${otpCode}`);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from('trial_email_otp').insert({
      email,
      code_hash: codeHash,
      expires_at: expiresAt,
      ip_hash: ipHash,
    });
    if (insertError) {
      if (isMissingRelation(insertError)) {
        return res.status(500).json({
          error: 'Tabela de OTP não encontrada. Execute trial_email_otp_phase1.sql no Supabase.',
        });
      }
      throw insertError;
    }

    const resendKey = await getResendApiKey();
    if (!resendKey) {
      return res.status(500).json({ error: 'Email service not configured (RESEND_API_KEY)' });
    }

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: 'Veredicta - Plataforma de Petições Jurídicas <contato@veredictajus.com>',
      to: [email],
      subject: 'Seu código de verificação - Veredicta',
      html: buildOtpTemplate(fullName, otpCode),
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao enviar OTP por e-mail', details: error?.message || String(error) });
  }
};

export default POST;

