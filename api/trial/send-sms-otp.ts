import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

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

function hashValue(raw: string) {
  const salt = process.env.TRIAL_OTP_HASH_SALT || process.env.TRIAL_HASH_SALT || 'veredicta-trial-otp-salt';
  return createHash('sha256').update(`${salt}:${raw}`).digest('hex');
}

function normalizePhone(input: string) {
  const digits = String(input || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return '';
}

function extractIp(req: VercelRequest) {
  const xff = String(req.headers?.['x-forwarded-for'] || '');
  const candidate = xff.split(',')[0]?.trim();
  if (candidate) return candidate;
  return String((req as any).ip || (req as any).socket?.remoteAddress || '');
}

function isMissingRelation(error: any) {
  const msg = String(error?.message || '');
  return error?.code === '42P01' || /relation .* does not exist/i.test(msg);
}

async function validateEmailOtpVerificationToken(
  supabase: ReturnType<typeof createClient>,
  email: string,
  emailOtpToken: string
) {
  const tokenHash = hashValue(`verify:${emailOtpToken}`);
  const { data: row, error } = await supabase
    .from('trial_email_otp')
    .select('id, verified_at, used_for_trial')
    .eq('email', email)
    .eq('verification_token_hash', tokenHash)
    .eq('consumed', true)
    .order('verified_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingRelation(error)) {
      return {
        ok: false,
        status: 500,
        error: 'Tabela de OTP e-mail não encontrada. Execute trial_email_otp_phase1.sql.',
      };
    }
    throw error;
  }
  if (!row) {
    return { ok: false, status: 403, error: 'Validação de e-mail não encontrada ou expirada.' };
  }
  if ((row as any).used_for_trial) {
    return { ok: false, status: 409, error: 'Este token de e-mail já foi utilizado.' };
  }
  const verifiedAt = new Date(String((row as any).verified_at || 0));
  if (Number.isNaN(verifiedAt.getTime()) || Date.now() - verifiedAt.getTime() > 20 * 60 * 1000) {
    return { ok: false, status: 403, error: 'Validação de e-mail expirada. Solicite um novo código.' };
  }

  return { ok: true as const };
}

function getDiditConfig() {
  const apiKey = String(process.env.DIDIT_API_KEY || '').trim();
  const baseUrl = String(process.env.DIDIT_BASE_URL || 'https://verification.didit.me').replace(/\/$/, '');
  const channel = String(process.env.DIDIT_CHANNEL || 'sms').trim().toLowerCase();
  if (!apiKey) {
    throw new Error('DIDIT_API_KEY não configurada');
  }
  return { apiKey, baseUrl, channel };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const email = String((body as any).email || '').trim().toLowerCase();
    const phoneInput = String((body as any).phone || '').trim();
    const phoneE164 = normalizePhone(phoneInput);
    const emailOtpToken = String((body as any).email_otp_token || '').trim();
    const website = String((body as any).website || '').trim();

    if (website) return res.status(400).json({ error: 'Solicitação inválida.' });
    if (!email || !phoneE164 || !emailOtpToken) {
      return res.status(400).json({ error: 'email, phone e email_otp_token são obrigatórios' });
    }

    const supabase = getSupabaseServiceClient();
    const ipHash = hashValue(`ip:${extractIp(req) || 'unknown'}`);

    const emailTokenValidation = await validateEmailOtpVerificationToken(supabase, email, emailOtpToken);
    if (!emailTokenValidation.ok) {
      return res.status(emailTokenValidation.status).json({ error: emailTokenValidation.error });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const [recentByPhone, recentByIp, cooldownByPhone] = await Promise.all([
      supabase
        .from('trial_sms_otp')
        .select('id', { count: 'exact', head: true })
        .eq('phone_e164', phoneE164)
        .gte('created_at', oneHourAgo),
      supabase
        .from('trial_sms_otp')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', oneHourAgo),
      supabase
        .from('trial_sms_otp')
        .select('id', { count: 'exact', head: true })
        .eq('phone_e164', phoneE164)
        .gte('created_at', oneMinuteAgo),
    ]);

    const errors = [recentByPhone.error, recentByIp.error, cooldownByPhone.error].filter(Boolean);
    if (errors.length > 0) {
      const firstError = errors[0] as any;
      if (isMissingRelation(firstError)) {
        return res.status(500).json({
          error: 'Tabela de OTP SMS não encontrada. Execute trial_sms_otp_phase1.sql no Supabase.',
        });
      }
      throw firstError;
    }

    if (Number(cooldownByPhone.count || 0) > 0) {
      return res.status(429).json({ error: 'Aguarde 60 segundos para reenviar o código por SMS.' });
    }
    if (Number(recentByPhone.count || 0) >= 6 || Number(recentByIp.count || 0) >= 20) {
      return res.status(429).json({ error: 'Limite de envio de SMS atingido. Tente novamente mais tarde.' });
    }

    const { apiKey, baseUrl, channel } = getDiditConfig();
    const diditPayload: Record<string, any> = { phone_number: phoneE164 };
    if (channel) diditPayload.channel = channel;

    const diditResponse = await fetch(`${baseUrl}/v3/phone/send/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(diditPayload),
    });
    const diditData = await diditResponse.json().catch(() => ({}));

    if (!diditResponse.ok) {
      const diditMessage =
        String(
          (diditData as any)?.message ||
            (diditData as any)?.error ||
            (diditData as any)?.detail ||
            (diditData as any)?.errors?.[0]?.message ||
            ''
        ).trim() || 'Falha ao enviar OTP por SMS';
      return res.status(502).json({ error: `Didit: ${diditMessage}` });
    }

    const providerRef = String(
      (diditData as any)?.id || (diditData as any)?.verification_id || (diditData as any)?.request_id || (diditData as any)?.data?.id || ''
    ).trim();
    const providerStatus = String(
      (diditData as any)?.status || (diditData as any)?.data?.status || (diditData as any)?.result || 'sent'
    ).trim();

    const { error: insertError } = await supabase.from('trial_sms_otp').insert({
      phone_e164: phoneE164,
      provider_ref: providerRef || null,
      provider_status: providerStatus || 'sent',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      ip_hash: ipHash,
    });

    if (insertError) {
      if (isMissingRelation(insertError)) {
        return res.status(500).json({
          error: 'Tabela de OTP SMS não encontrada. Execute trial_sms_otp_phase1.sql no Supabase.',
        });
      }
      throw insertError;
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao enviar OTP por SMS', details: error?.message || String(error) });
  }
}

