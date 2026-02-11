-- Tokens de ativação da Peça Piloto (sem expiração)
-- Execute este script no Supabase SQL Editor

-- 1) Tabela de tokens (uso único)
CREATE TABLE IF NOT EXISTS public.pilot_activation_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by text,
  redeemed_at timestamptz,
  redeemed_by text,
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pilot_activation_tokens_token
  ON public.pilot_activation_tokens (token);

CREATE INDEX IF NOT EXISTS idx_pilot_activation_tokens_created_at
  ON public.pilot_activation_tokens (created_at DESC);

-- 2) Sequência para protocolo amigável (VP-YYYY-NNNN)
CREATE SEQUENCE IF NOT EXISTS public.pilot_activation_seq;

-- 3) Helper: validar admin (baseado em user_profiles.role)
CREATE OR REPLACE FUNCTION public._assert_admin(p_admin_uid text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_admin_uid IS NULL OR length(trim(p_admin_uid)) = 0 THEN
    RAISE EXCEPTION 'admin uid ausente';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE upper(up.firebase_uid) = upper(p_admin_uid)
      AND up.role = 'admin'
      AND coalesce(up.is_active, true) = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public._assert_admin(text) TO anon, authenticated;

-- 4) Admin: criar token (sem expiração)
CREATE OR REPLACE FUNCTION public.admin_create_pilot_activation_token(
  p_admin_uid text
)
RETURNS TABLE(token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
BEGIN
  PERFORM public._assert_admin(p_admin_uid);

  v_token := 'VP-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.pilot_activation_seq')::text, 4, '0');

  INSERT INTO public.pilot_activation_tokens (token, created_by)
  VALUES (v_token, p_admin_uid);

  token := v_token;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_pilot_activation_token(text) TO anon, authenticated;

-- 5) Admin: listar tokens
CREATE OR REPLACE FUNCTION public.admin_list_pilot_activation_tokens(
  p_admin_uid text,
  p_limit int DEFAULT 200
)
RETURNS TABLE(
  token text,
  created_at timestamptz,
  created_by text,
  redeemed_at timestamptz,
  redeemed_by text,
  revoked_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_admin(p_admin_uid);

  RETURN QUERY
  SELECT
    pat.token,
    pat.created_at,
    pat.created_by,
    pat.redeemed_at,
    pat.redeemed_by,
    pat.revoked_at
  FROM public.pilot_activation_tokens pat
  ORDER BY pat.created_at DESC
  LIMIT greatest(1, least(coalesce(p_limit, 200), 500));
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_pilot_activation_tokens(text, int) TO anon, authenticated;

-- 6) Público (após login): resgatar token e ativar bônus FREE (is_bonus=true)
CREATE OR REPLACE FUNCTION public.redeem_pilot_activation_token(
  p_token text,
  p_firebase_uid text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Token inválido.');
  END IF;

  IF p_firebase_uid IS NULL OR length(trim(p_firebase_uid)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Usuário inválido.');
  END IF;

  -- marcar como resgatado (uso único)
  UPDATE public.pilot_activation_tokens
  SET
    redeemed_at = timezone('utc'::text, now()),
    redeemed_by = p_firebase_uid
  WHERE token = p_token
    AND redeemed_at IS NULL
    AND revoked_at IS NULL;

  IF NOT FOUND THEN
    -- pode ser inexistente, revogado ou já usado
    IF EXISTS (SELECT 1 FROM public.pilot_activation_tokens WHERE token = p_token AND revoked_at IS NOT NULL) THEN
      RETURN jsonb_build_object('success', false, 'message', 'Este protocolo foi revogado.');
    END IF;
    IF EXISTS (SELECT 1 FROM public.pilot_activation_tokens WHERE token = p_token AND redeemed_at IS NOT NULL) THEN
      RETURN jsonb_build_object('success', false, 'message', 'Este protocolo já foi utilizado.');
    END IF;
    RETURN jsonb_build_object('success', false, 'message', 'Protocolo não encontrado.');
  END IF;

  -- se já tiver bônus ativo, não duplicar
  IF EXISTS (
    SELECT 1
    FROM public.user_subscriptions us
    WHERE us.user_id = p_firebase_uid
      AND lower(coalesce(us.plan_code, '')) = 'free'
      AND coalesce(us.is_bonus, false) = true
      AND lower(coalesce(us.status, '')) = 'active'
  ) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Bônus já estava ativo.');
  END IF;

  -- criar o bônus free (sem expiração: usamos um next_billing_date bem longo)
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_code,
    status,
    next_billing_date,
    is_bonus,
    created_at,
    updated_at
  )
  VALUES (
    p_firebase_uid,
    'free',
    'active',
    timezone('utc'::text, now()) + interval '365 days',
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_pilot_activation_token(text, text) TO anon, authenticated;

