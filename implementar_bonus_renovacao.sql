-- IMPLEMENTAR SISTEMA DE BÔNUS DE RENOVAÇÃO
-- Execute este script no Supabase Dashboard

-- 1. Adicionar coluna de bônus na tabela plans
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS renewal_bonus INTEGER DEFAULT 0;

-- 2. Atualizar planos com bônus de renovação
UPDATE plans 
SET renewal_bonus = 1 
WHERE name = 'Pro';

UPDATE plans 
SET renewal_bonus = 3 
WHERE name = 'Elite';

-- 3. Criar tabela para controlar renovações e bônus
CREATE TABLE IF NOT EXISTS subscription_renewals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  renewal_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  base_petitions INTEGER NOT NULL,
  bonus_petitions INTEGER DEFAULT 0,
  total_petitions INTEGER NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_subscription_renewals_user_id ON subscription_renewals(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_renewals_plan_code ON subscription_renewals(plan_code);
CREATE INDEX IF NOT EXISTS idx_subscription_renewals_renewal_date ON subscription_renewals(renewal_date);
CREATE INDEX IF NOT EXISTS idx_subscription_renewals_status ON subscription_renewals(status);

-- 5. Habilitar RLS
ALTER TABLE subscription_renewals ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
CREATE POLICY "Users can view their own renewals" ON subscription_renewals
FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Service role can manage all renewals" ON subscription_renewals
FOR ALL USING (auth.role() = 'service_role');

-- 7. Função para processar renovação com bônus
CREATE OR REPLACE FUNCTION process_subscription_renewal(
  p_user_id TEXT,
  p_plan_code TEXT,
  p_stripe_subscription_id TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_plan RECORD;
  v_bonus_petitions INTEGER;
  v_total_petitions INTEGER;
  v_renewal_id UUID;
BEGIN
  -- Buscar informações do plano
  SELECT petitions_included, renewal_bonus
  INTO v_plan
  FROM plans 
  WHERE plan_code = p_plan_code AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Plano não encontrado'
    );
  END IF;
  
  -- Calcular bônus
  v_bonus_petitions := COALESCE(v_plan.renewal_bonus, 0);
  v_total_petitions := v_plan.petitions_included + v_bonus_petitions;
  
  -- Criar registro de renovação
  INSERT INTO subscription_renewals (
    user_id,
    plan_code,
    base_petitions,
    bonus_petitions,
    total_petitions,
    stripe_subscription_id
  ) VALUES (
    p_user_id,
    p_plan_code,
    v_plan.petitions_included,
    v_bonus_petitions,
    v_total_petitions,
    p_stripe_subscription_id
  ) RETURNING id INTO v_renewal_id;
  
  -- Atualizar assinatura do usuário
  UPDATE user_subscriptions 
  SET 
    status = 'active',
    updated_at = timezone('utc'::text, now())
  WHERE user_id = p_user_id AND plan_code = p_plan_code;
  
  RETURN json_build_object(
    'success', true,
    'renewal_id', v_renewal_id,
    'base_petitions', v_plan.petitions_included,
    'bonus_petitions', v_bonus_petitions,
    'total_petitions', v_total_petitions,
    'message', CASE 
      WHEN v_bonus_petitions > 0 THEN 
        'Renovação processada! Você recebeu ' || v_bonus_petitions || ' petições bônus!'
      ELSE 
        'Renovação processada com sucesso!'
    END
  );
END;
$$ LANGUAGE plpgsql;

-- 8. Função para verificar bônus de renovação
CREATE OR REPLACE FUNCTION get_renewal_bonus_info(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_current_plan RECORD;
  v_renewal_info JSON;
BEGIN
  -- Buscar plano atual do usuário
  SELECT us.plan_code, p.name, p.petitions_included, p.renewal_bonus
  INTO v_current_plan
  FROM user_subscriptions us
  JOIN plans p ON us.plan_code = p.plan_code
  WHERE us.user_id = p_user_id 
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'has_plan', false,
      'message', 'Usuário não possui plano ativo'
    );
  END IF;
  
  -- Buscar última renovação
  SELECT json_build_object(
    'renewal_date', renewal_date,
    'base_petitions', base_petitions,
    'bonus_petitions', bonus_petitions,
    'total_petitions', total_petitions
  )
  INTO v_renewal_info
  FROM subscription_renewals
  WHERE user_id = p_user_id
  ORDER BY renewal_date DESC
  LIMIT 1;
  
  RETURN json_build_object(
    'has_plan', true,
    'current_plan', json_build_object(
      'name', v_current_plan.name,
      'base_petitions', v_current_plan.petitions_included,
      'renewal_bonus', COALESCE(v_current_plan.renewal_bonus, 0)
    ),
    'last_renewal', v_renewal_info,
    'next_renewal_bonus', COALESCE(v_current_plan.renewal_bonus, 0)
  );
END;
$$ LANGUAGE plpgsql;

-- 9. Conceder permissões
GRANT EXECUTE ON FUNCTION process_subscription_renewal(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_renewal_bonus_info(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_subscription_renewal(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_renewal_bonus_info(TEXT) TO service_role;

-- 10. Verificar se as colunas foram adicionadas
SELECT 
  'Verificação da estrutura' as categoria,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'plans' 
  AND column_name IN ('renewal_bonus')
ORDER BY ordinal_position;

-- 11. Verificar planos com bônus
SELECT 
  'Planos com bônus de renovação' as categoria,
  name,
  petitions_included,
  renewal_bonus,
  (petitions_included + COALESCE(renewal_bonus, 0)) as total_com_bonus
FROM plans
WHERE renewal_bonus > 0
ORDER BY renewal_bonus DESC;




















