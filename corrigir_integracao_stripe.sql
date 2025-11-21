-- Script para corrigir integração com Stripe
-- Execute este script para adicionar suporte completo ao Stripe

-- 1. Adicionar coluna stripe_price_id na tabela plans
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 2. Adicionar coluna stripe_product_id na tabela plans
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;

-- 3. Atualizar planos com Price IDs do Stripe (substitua pelos IDs reais)
UPDATE plans 
SET stripe_price_id = 'price_1SIx0xLnE1r0oPJFSN2Kt41R',
    stripe_product_id = 'prod_stripe_start'
WHERE plan_code = 'start';

UPDATE plans 
SET stripe_price_id = 'price_1SIx2XLnE1r0oPJFljNvb1t3',
    stripe_product_id = 'prod_stripe_pro'
WHERE plan_code = 'pro';

UPDATE plans 
SET stripe_price_id = 'price_1SIx3jLnE1r0oPJFw8pvuZnO',
    stripe_product_id = 'prod_stripe_elite'
WHERE plan_code = 'elite';

-- 4. Plano gratuito não precisa de Stripe
UPDATE plans 
SET stripe_price_id = NULL,
    stripe_product_id = NULL
WHERE plan_code = 'free';

-- 5. Verificar se as colunas foram adicionadas
SELECT 
  'Estrutura atualizada da tabela plans' as categoria,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'plans' 
  AND column_name IN ('stripe_price_id', 'stripe_product_id')
ORDER BY column_name;

-- 6. Verificar planos com Stripe configurado
SELECT 
  'Planos com Stripe configurado' as categoria,
  plan_code,
  name,
  price,
  stripe_price_id,
  stripe_product_id,
  is_active
FROM plans
WHERE stripe_price_id IS NOT NULL
ORDER BY price;

-- 7. Criar tabela para logs de pagamentos Stripe (se não existir)
CREATE TABLE IF NOT EXISTS stripe_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT,
  amount INTEGER NOT NULL, -- em centavos
  currency TEXT DEFAULT 'brl',
  status TEXT NOT NULL, -- pending, succeeded, failed, cancelled
  plan_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_stripe_payments_user_id ON stripe_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_status ON stripe_payments(status);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_stripe_payment_intent_id ON stripe_payments(stripe_payment_intent_id);

-- 9. Verificar se a tabela foi criada
SELECT 
  'Tabela stripe_payments criada' as categoria,
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'stripe_payments'
ORDER BY ordinal_position;




















