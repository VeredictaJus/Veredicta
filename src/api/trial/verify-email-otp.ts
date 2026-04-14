import type { Handler } from 'vite-plugin-api-routes';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';

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

function hashValue(raw: string) {
  const salt = process.env.TRIAL_OTP_HASH_SALT || process.env.TRIAL_HASH_SALT || 'veredicta-trial-otp-salt';
  return createHash('sha256').update(`${salt}:${raw}`).digest('hex');
}

function isMissingRelation(error: any) {
  const msg = String(error?.message || '');
  return error?.code === '42P01' || /relation .* does not exist/i.test(msg);
}

export const POST: Handler = async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    if (!email || !code) {
      return res.status(400).json({ error: 'email e code são obrigatórios' });
    }
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Código inválido' });
    }

    const supabase = getSupabaseServiceClient();
    const { data: otpRow, error: fetchError } = await supabase
      .from('trial_email_otp')
      .select('*')
      .eq('email', email)
      .eq('consumed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      if (isMissingRelation(fetchError)) {
        return res.status(500).json({
          error: 'Tabela de OTP não encontrada. Execute trial_email_otp_phase1.sql no Supabase.',
        });
      }
      throw fetchError;
    }

    if (!otpRow) {
      return res.status(400).json({ error: 'Código não encontrado. Solicite um novo código.' });
    }

    const now = new Date();
    const expiresAt = new Date(String(otpRow.expires_at || 0));
    if (Number.isNaN(expiresAt.getTime()) || now > expiresAt) {
      await supabase.from('trial_email_otp').update({ consumed: true }).eq('id', otpRow.id);
      return res.status(400).json({ error: 'Código expirado. Solicite um novo código.' });
    }

    const attempts = Number(otpRow.attempt_count || 0);
    const maxAttempts = Number(otpRow.max_attempts || 5);
    if (attempts >= maxAttempts) {
      await supabase.from('trial_email_otp').update({ consumed: true }).eq('id', otpRow.id);
      return res.status(429).json({ error: 'Número máximo de tentativas excedido.' });
    }

    const expectedHash = hashValue(`otp:${email}:${code}`);
    if (expectedHash !== String(otpRow.code_hash || '')) {
      const nextAttempts = attempts + 1;
      await supabase
        .from('trial_email_otp')
        .update({
          attempt_count: nextAttempts,
          consumed: nextAttempts >= maxAttempts,
        })
        .eq('id', otpRow.id);
      return res.status(400).json({ error: 'Código incorreto.' });
    }

    const verificationToken = randomBytes(24).toString('hex');
    const verificationTokenHash = hashValue(`verify:${verificationToken}`);
    const { error: updateError } = await supabase
      .from('trial_email_otp')
      .update({
        consumed: true,
        verified_at: now.toISOString(),
        verification_token_hash: verificationTokenHash,
      })
      .eq('id', otpRow.id);

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      verification_token: verificationToken,
      expires_in_seconds: 20 * 60,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao validar OTP', details: error?.message || String(error) });
  }
};

export default POST;

