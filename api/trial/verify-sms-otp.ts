import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';

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

function isMissingRelation(error: any) {
  const msg = String(error?.message || '');
  return error?.code === '42P01' || /relation .* does not exist/i.test(msg);
}

function getDiditConfig() {
  const apiKey = String(process.env.DIDIT_API_KEY || '').trim();
  const baseUrl = String(process.env.DIDIT_BASE_URL || 'https://verification.didit.me').replace(/\/$/, '');
  if (!apiKey) {
    throw new Error('DIDIT_API_KEY não configurada');
  }
  return { apiKey, baseUrl };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const phoneE164 = normalizePhone(String((body as any).phone || '').trim());
    const code = String((body as any).code || '').trim();
    if (!phoneE164 || !/^\d{4,8}$/.test(code)) {
      return res.status(400).json({ error: 'phone e code válidos são obrigatórios' });
    }

    const supabase = getSupabaseServiceClient();
    const { data: otpRow, error: fetchError } = await supabase
      .from('trial_sms_otp')
      .select('*')
      .eq('phone_e164', phoneE164)
      .eq('consumed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      if (isMissingRelation(fetchError)) {
        return res.status(500).json({
          error: 'Tabela de OTP SMS não encontrada. Execute trial_sms_otp_phase1.sql no Supabase.',
        });
      }
      throw fetchError;
    }
    if (!otpRow) {
      return res.status(400).json({ error: 'Código SMS não encontrado. Solicite um novo código.' });
    }

    const now = new Date();
    const expiresAt = new Date(String((otpRow as any).expires_at || 0));
    if (Number.isNaN(expiresAt.getTime()) || now > expiresAt) {
      await supabase.from('trial_sms_otp').update({ consumed: true }).eq('id', (otpRow as any).id);
      return res.status(400).json({ error: 'Código SMS expirado. Solicite um novo código.' });
    }

    const attempts = Number((otpRow as any).attempt_count || 0);
    const maxAttempts = Number((otpRow as any).max_attempts || 5);
    if (attempts >= maxAttempts) {
      await supabase.from('trial_sms_otp').update({ consumed: true }).eq('id', (otpRow as any).id);
      return res.status(429).json({ error: 'Número máximo de tentativas excedido.' });
    }

    const { apiKey, baseUrl } = getDiditConfig();
    const diditResponse = await fetch(`${baseUrl}/v3/phone/check/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        phone_number: phoneE164,
        code,
      }),
    });
    const diditData = await diditResponse.json().catch(() => ({}));

    if (!diditResponse.ok) {
      const nextAttempts = attempts + 1;
      await supabase
        .from('trial_sms_otp')
        .update({
          attempt_count: nextAttempts,
          consumed: nextAttempts >= maxAttempts,
          provider_status: String((diditData as any)?.status || 'invalid_code'),
        })
        .eq('id', (otpRow as any).id);

      const message =
        String(
          (diditData as any)?.message ||
            (diditData as any)?.error ||
            (diditData as any)?.detail ||
            (diditData as any)?.errors?.[0]?.message ||
            ''
        ).trim() || 'Código SMS inválido.';
      return res.status(400).json({ error: `Didit: ${message}` });
    }

    const verificationToken = randomBytes(24).toString('hex');
    const verificationTokenHash = hashValue(`verify:${verificationToken}`);
    const { error: updateError } = await supabase
      .from('trial_sms_otp')
      .update({
        consumed: true,
        verified_at: now.toISOString(),
        verification_token_hash: verificationTokenHash,
        provider_status: String((diditData as any)?.status || (diditData as any)?.data?.status || 'verified'),
      })
      .eq('id', (otpRow as any).id);

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      verification_token: verificationToken,
      expires_in_seconds: 20 * 60,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao validar OTP SMS', details: error?.message || String(error) });
  }
}

