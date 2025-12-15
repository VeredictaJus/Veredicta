-- Script para atualizar os IDs do Stripe para o plano de teste
-- Execute este script APÓS criar o produto no Stripe Dashboard
-- 
-- INSTRUÇÕES:
-- 1. Crie o produto no Stripe Dashboard (veja GUIA_CRIAR_PLANO_TESTE_STRIPE.md)
-- 2. Copie o Price ID (começa com price_)
-- 3. Copie o Product ID (começa com prod_)
-- 4. Substitua os valores abaixo pelos IDs reais
-- 5. Execute este script

-- Atualizar o plano de teste com os IDs do Stripe
UPDATE plans 
SET 
    stripe_price_id = 'price_1SYbSbLnE1r0oPJFloCSxOBA',  -- Price ID do Stripe
    stripe_product_id = 'prod_TVciqJZXhwJ6dR',            -- Product ID do Stripe
    updated_at = NOW()
WHERE plan_code = 'test';

-- Verificar se foi atualizado corretamente
SELECT 
    plan_code,
    name,
    price,
    price / 100.0 as price_in_reais,
    stripe_price_id,
    stripe_product_id,
    is_active,
    created_at,
    updated_at
FROM plans 
WHERE plan_code = 'test';

-- Se os IDs aparecerem corretamente, está tudo certo! ✅

