-- Script para debugar autenticação e inserção
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuário autenticado atual
SELECT auth.uid() as current_auth_user;

-- 2. Verificar se as políticas estão funcionando
-- (Este SELECT deve retornar apenas cartões do usuário atual)
SELECT * FROM user_payment_cards;

-- 3. Testar a condição das políticas
SELECT 
    auth.uid() as auth_uid,
    auth.uid()::text as auth_uid_text,
    'YNTB2V3606WPxV0zlZxLQNV1tCm1' as test_user_id,
    (auth.uid()::text = 'YNTB2V3606WPxV0zlZxLQNV1tCm1') as condition_result;

-- 4. Tentar inserção com dados de teste
-- (Descomente para testar)
/*
INSERT INTO user_payment_cards (
    user_id,
    last_four,
    brand,
    expiry_month,
    expiry_year,
    holder_name,
    is_default
) VALUES (
    auth.uid()::text,
    '1234',
    'visa',
    12,
    2025,
    'Teste Debug',
    true
) RETURNING *;
*/

-- 5. Verificar políticas novamente
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_payment_cards';

























