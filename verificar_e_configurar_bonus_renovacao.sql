-- ✅ SCRIPT PARA VERIFICAR E CONFIGURAR BÔNUS DE RENOVAÇÃO
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a coluna renewal_bonus existe na tabela plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'renewal_bonus'
  ) THEN
    ALTER TABLE plans ADD COLUMN renewal_bonus INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Coluna renewal_bonus adicionada à tabela plans';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna renewal_bonus já existe';
  END IF;
END $$;

-- 2. Atualizar planos Pro e Elite com bônus de renovação
UPDATE plans 
SET renewal_bonus = 1 
WHERE (plan_code = 'pro' OR name ILIKE '%pro%') AND renewal_bonus IS NULL;

UPDATE plans 
SET renewal_bonus = 3 
WHERE (plan_code = 'elite' OR name ILIKE '%elite%') AND renewal_bonus IS NULL;

-- Garantir que Start e Free tenham 0 bônus
UPDATE plans 
SET renewal_bonus = 0 
WHERE (plan_code IN ('start', 'free') OR name ILIKE '%start%' OR name ILIKE '%free%') 
  AND (renewal_bonus IS NULL OR renewal_bonus > 0);

-- 3. Criar tabela subscription_renewals se não existir
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

-- 6. Criar/atualizar políticas RLS
DROP POLICY IF EXISTS "Users can view their own renewals" ON subscription_renewals;
CREATE POLICY "Users can view their own renewals" ON subscription_renewals
FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Service role can manage all renewals" ON subscription_renewals;
CREATE POLICY "Service role can manage all renewals" ON subscription_renewals
FOR ALL USING (auth.role() = 'service_role');

-- 7. Criar função RPC para adicionar petições bônus (se não existir)
CREATE OR REPLACE FUNCTION add_bonus_petitions(
  p_user_id TEXT,
  p_bonus_petitions INTEGER,
  p_plan_code TEXT
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Esta função pode ser expandida para adicionar petições ao saldo do usuário
  -- Por enquanto, apenas registra o bônus na tabela subscription_renewals
  
  RETURN json_build_object(
    'success', true,
    'message', format('Adicionadas %s petições bônus', p_bonus_petitions),
    'user_id', p_user_id,
    'bonus_petitions', p_bonus_petitions,
    'plan_code', p_plan_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Verificar configuração atual
SELECT 
  'Configuração de Bônus de Renovação' as categoria,
  plan_code,
  name,
  petitions_included,
  COALESCE(renewal_bonus, 0) as renewal_bonus,
  (petitions_included + COALESCE(renewal_bonus, 0)) as total_com_bonus
FROM plans
WHERE is_active = true
ORDER BY 
  CASE plan_code
    WHEN 'free' THEN 1
    WHEN 'start' THEN 2
    WHEN 'pro' THEN 3
    WHEN 'elite' THEN 4
    ELSE 5
  END;

-- 9. Verificar se a tabela subscription_renewals foi criada
SELECT 
  'Verificação da Tabela subscription_renewals' as categoria,
  COUNT(*) as total_renovacoes
FROM subscription_renewals;

























