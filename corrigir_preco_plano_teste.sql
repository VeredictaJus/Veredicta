-- Script para corrigir o preço do plano de teste para R$ 1,00 (100 centavos)
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o preço atual
SELECT 
    plan_code,
    name,
    price,
    price / 100.0 as price_in_reais,
    CASE 
        WHEN price = 100 THEN '✅ CORRETO (R$ 1,00)'
        WHEN price = 10000 THEN '❌ ERRADO (R$ 100,00) - Precisa corrigir'
        ELSE CONCAT('⚠️ VALOR INESPERADO: R$ ', (price / 100.0)::text)
    END as status
FROM plans 
WHERE plan_code = 'test';

-- 2. Corrigir o preço para R$ 1,00 (100 centavos)
UPDATE plans 
SET 
    price = 100,  -- R$ 1,00 em centavos
    updated_at = NOW()
WHERE plan_code = 'test';

-- 3. Verificar se foi corrigido
SELECT 
    plan_code,
    name,
    price,
    price / 100.0 as price_in_reais,
    '✅ Preço corrigido para R$ 1,00' as status
FROM plans 
WHERE plan_code = 'test';













