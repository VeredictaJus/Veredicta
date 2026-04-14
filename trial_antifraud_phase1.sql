-- Fase 1 de antifraude para fluxo trial
-- Execute no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.trial_signup_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text NOT NULL,
  email_hash text NOT NULL,
  phone_hash text NOT NULL,
  success boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_trial_signup_attempts_created_at
  ON public.trial_signup_attempts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trial_signup_attempts_ip_hash
  ON public.trial_signup_attempts (ip_hash);

CREATE INDEX IF NOT EXISTS idx_trial_signup_attempts_email_hash
  ON public.trial_signup_attempts (email_hash);

CREATE INDEX IF NOT EXISTS idx_trial_signup_attempts_phone_hash
  ON public.trial_signup_attempts (phone_hash);

CREATE TABLE IF NOT EXISTS public.trial_identity_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  phone_hash text UNIQUE NOT NULL,
  email_hash text,
  firebase_uid text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trial_identity_registry_firebase_uid
  ON public.trial_identity_registry (firebase_uid);

-- Criação atômica da petição trial e consumo do benefício (1x)
-- Requer colunas adicionadas em add_trial_lifecycle_columns.sql
CREATE OR REPLACE FUNCTION public.create_trial_petition_atomic(
  p_client_id text,
  p_title text,
  p_description text,
  p_type text,
  p_status text default 'pending',
  p_priority text default 'normal',
  p_price numeric default 0,
  p_deadline timestamp with time zone default now(),
  p_assigned_writer_id text default null,
  p_files text[] default '{}'
)
RETURNS public.petitions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.user_profiles%ROWTYPE;
  v_petition public.petitions;
BEGIN
  SELECT *
    INTO v_profile
  FROM public.user_profiles
  WHERE firebase_uid = p_client_id
  FOR UPDATE;

  IF v_profile.id IS NULL THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;

  IF coalesce(v_profile.trial_petition_used, false) = true THEN
    RAISE EXCEPTION 'TRIAL_ALREADY_USED';
  END IF;

  INSERT INTO public.petitions (
    client_id,
    title,
    description,
    type,
    status,
    priority,
    price,
    deadline,
    assigned_writer_id,
    files,
    is_pilot
  ) VALUES (
    p_client_id,
    p_title,
    p_description,
    p_type,
    lower(coalesce(p_status, 'pending')),
    lower(coalesce(p_priority, 'normal')),
    p_price,
    p_deadline,
    p_assigned_writer_id,
    p_files,
    true
  ) RETURNING * INTO v_petition;

  UPDATE public.user_profiles
  SET
    trial_petition_used = true,
    trial_petition_used_at = now(),
    updated_at = now()
  WHERE firebase_uid = p_client_id;

  RETURN v_petition;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_trial_petition_atomic(
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  timestamp with time zone,
  text,
  text[]
) TO anon, authenticated;

