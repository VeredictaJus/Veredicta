-- Script para verificar se o plano de teste está configurado corretamente
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o plano existe e está ativo
SELECT 
    plan_code,
    name,
    price,
    price / 100.0 as price_in_reais,
    petitions_limit,
    petitions_included,
    is_active,
    stripe_price_id,
    stripe_product_id,
    validity_days,
    created_at,
    updated_at
FROM plans 
WHERE plan_code = 'test';

-- 2. Verificar todos os planos ativos (o que o cliente vê)
SELECT 
    plan_code,
    name,
    price / 100.0 as price_in_reais,
    is_active,
    CASE 
        WHEN is_active = true THEN '✅ VISÍVEL PARA CLIENTES'
        ELSE '❌ OCULTO (is_active = false)'
    END as status_visibilidade
FROM plans 
WHERE is_active = true
ORDER BY price;

-- 3. Se o plano não estiver ativo, ativar:
-- UPDATE plans 
-- SET is_active = true, updated_at = NOW()
-- WHERE plan_code = 'test';

-- 4. Se o plano não existir, execute o script create_test_plan.sql primeiro

