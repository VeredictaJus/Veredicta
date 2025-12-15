-- Script para criar um plano de teste de R$ 1,00
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se já existe um plano de teste
SELECT 
    plan_code, 
    name, 
    price, 
    petitions_limit,
    is_active
FROM plans 
WHERE plan_code = 'test' OR name ILIKE '%teste%';

-- 2. Garantir que as colunas necessárias existem
ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_code TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS petitions_limit INTEGER;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS api_access BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS support_level TEXT DEFAULT 'basic';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS validity_days INTEGER DEFAULT 30;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS renewal_bonus INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;

-- Adicionar constraint UNIQUE se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'plans_plan_code_unique'
    ) THEN
        ALTER TABLE plans ADD CONSTRAINT plans_plan_code_unique UNIQUE (plan_code);
    END IF;
END $$;

-- 3. Inserir plano de teste de R$ 1,00 (100 centavos)
INSERT INTO plans (
    name, 
    price, 
    petitions_included, 
    features, 
    description,
    priority_support, 
    custom_branding, 
    is_active, 
    subscribers,
    plan_code,
    petitions_limit,
    api_access,
    support_level,
    validity_days,
    renewal_bonus,
    stripe_price_id,
    stripe_product_id
) VALUES (
    'Plano Teste', 
    100,  -- R$ 1,00 em centavos
    1,    -- 1 petição incluída
    ARRAY[
        '1 petição de teste',
        'Entrega em 3-5 dias úteis', 
        '1 revisão gratuita',
        'Consulta com redator e chat incluso',
        'Validade: 7 dias',
        'Plano apenas para testes'
    ], 
    'Plano de teste com valor simbólico de R$ 1,00',
    false,  -- priority_support
    false,  -- custom_branding
    true,   -- is_active
    0,      -- subscribers
    'test', -- plan_code único
    1,      -- petitions_limit
    false,  -- api_access
    'basic', -- support_level
    7,      -- validity_days (7 dias)
    0,      -- renewal_bonus (sem bônus)
    'price_1SYbSbLnE1r0oPJFloCSxOBA',  -- stripe_price_id
    'prod_TVciqJZXhwJ6dR'              -- stripe_product_id
)
ON CONFLICT (plan_code) 
DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    petitions_included = EXCLUDED.petitions_included,
    features = EXCLUDED.features,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    petitions_limit = EXCLUDED.petitions_limit,
    validity_days = EXCLUDED.validity_days,
    renewal_bonus = EXCLUDED.renewal_bonus,
    stripe_price_id = COALESCE(EXCLUDED.stripe_price_id, plans.stripe_price_id),
    stripe_product_id = COALESCE(EXCLUDED.stripe_product_id, plans.stripe_product_id),
    updated_at = NOW();

-- 4. Verificar se o plano foi criado com sucesso
SELECT 
    plan_code,
    name,
    price,
    price / 100.0 as price_in_reais,
    petitions_limit,
    petitions_included,
    validity_days,
    renewal_bonus,
    stripe_price_id,
    stripe_product_id,
    is_active,
    features,
    description
FROM plans 
WHERE plan_code = 'test';

-- 5. IDs do Stripe já configurados:
-- ✅ stripe_price_id: price_1SYbSbLnE1r0oPJFloCSxOBA
-- ✅ stripe_product_id: prod_TVciqJZXhwJ6dR

