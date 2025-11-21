-- Função RPC para atualizar assinatura do usuário
-- Esta função bypassa RLS porque usa SECURITY DEFINER
-- Execute este script no Supabase SQL Editor

CREATE OR REPLACE FUNCTION update_user_subscription(
  p_user_id TEXT,
  p_plan_code TEXT,
  p_status TEXT DEFAULT 'active',
  p_next_billing_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id TEXT,
  plan_code TEXT,
  status TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_billing_date TIMESTAMP WITH TIME ZONE;
  v_existing_id UUID;
BEGIN
  -- Calcular next_billing_date se não fornecido
  IF p_next_billing_date IS NULL THEN
    v_next_billing_date := NOW() + INTERVAL '30 days';
  ELSE
    v_next_billing_date := p_next_billing_date;
  END IF;

  -- Verificar se já existe uma assinatura ativa
  SELECT us.id INTO v_existing_id
  FROM user_subscriptions us
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Atualizar assinatura existente
    UPDATE user_subscriptions us
    SET
      plan_code = p_plan_code,
      status = p_status,
      next_billing_date = v_next_billing_date,
      updated_at = NOW()
    WHERE us.id = v_existing_id
    RETURNING
      us.id,
      us.user_id,
      us.plan_code,
      us.status,
      us.updated_at
    INTO
      id, user_id, plan_code, status, updated_at;
  ELSE
    -- Criar nova assinatura
    INSERT INTO user_subscriptions (
      user_id,
      plan_code,
      status,
      next_billing_date,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      p_plan_code,
      p_status,
      v_next_billing_date,
      NOW(),
      NOW()
    )
    RETURNING
      user_subscriptions.id,
      user_subscriptions.user_id,
      user_subscriptions.plan_code,
      user_subscriptions.status,
      user_subscriptions.updated_at
    INTO
      id, user_id, plan_code, status, updated_at;
  END IF;

  RETURN NEXT;
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION update_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_subscription TO anon;

