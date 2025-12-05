-- Script para remover/desativar o plano de teste
-- Execute este script no Supabase SQL Editor

-- Opção 1: Desativar o plano (recomendado - mantém histórico)
-- O plano não aparecerá mais para clientes, mas os dados são preservados
UPDATE plans 
SET 
    is_active = false,
    updated_at = NOW()
WHERE plan_code = 'test';

-- Verificar se foi desativado
SELECT 
    plan_code,
    name,
    price / 100.0 as price_in_reais,
    is_active,
    CASE 
        WHEN is_active = true THEN '✅ ATIVO (visível para clientes)'
        ELSE '❌ DESATIVADO (oculto para clientes)'
    END as status
FROM plans 
WHERE plan_code = 'test';

-- Opção 2: Deletar completamente o plano (use com cuidado!)
-- Descomente as linhas abaixo se quiser deletar permanentemente:
/*
DELETE FROM plans 
WHERE plan_code = 'test';

-- Verificar se foi deletado
SELECT * FROM plans WHERE plan_code = 'test';
-- Deve retornar 0 linhas
*/













