-- Fluxo de trial com regularização pós-entrega
-- Executar no SQL Editor do Supabase

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_petition_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_petition_used_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS regularization_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS regularized_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_origin text;

COMMENT ON COLUMN public.user_profiles.is_trial IS 'Usuário em jornada trial simplificada';
COMMENT ON COLUMN public.user_profiles.trial_petition_used IS 'Consumiu a única petição do trial';
COMMENT ON COLUMN public.user_profiles.regularization_required IS 'Deve finalizar cadastro para continuar';
COMMENT ON COLUMN public.user_profiles.trial_origin IS 'Origem da entrada trial (ex.: qr_code)';

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_trial
  ON public.user_profiles (is_trial);

CREATE INDEX IF NOT EXISTS idx_user_profiles_regularization_required
  ON public.user_profiles (regularization_required);

