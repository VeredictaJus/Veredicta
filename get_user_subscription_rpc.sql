-- Função RPC para buscar assinatura ativa do usuário
-- Esta função bypassa RLS porque usa SECURITY DEFINER
-- Execute este script no Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_user_subscription(
  p_user_id TEXT
)
RETURNS TABLE (
  id UUID,
  user_id TEXT,
  plan_code TEXT,
  status TEXT,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.user_id,
    us.plan_code,
    us.status,
    us.next_billing_date,
    us.created_at,
    us.updated_at
  FROM user_subscriptions us
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
  ORDER BY us.updated_at DESC
  LIMIT 1;
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription TO anon;











