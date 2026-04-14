-- OTP por e-mail (Resend) para fluxo de trial
-- Execute no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.trial_email_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  consumed boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  verification_token_hash text,
  used_for_trial boolean NOT NULL DEFAULT false,
  used_for_trial_at timestamptz,
  ip_hash text
);

CREATE INDEX IF NOT EXISTS idx_trial_email_otp_email_created
  ON public.trial_email_otp (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trial_email_otp_expires_at
  ON public.trial_email_otp (expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_email_otp_verification_token_hash
  ON public.trial_email_otp (verification_token_hash)
  WHERE verification_token_hash IS NOT NULL;

