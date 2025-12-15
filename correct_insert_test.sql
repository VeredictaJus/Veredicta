-- Script correto para testar inserção de cartão
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuário autenticado
SELECT auth.uid() as current_user_id, auth.uid()::text as current_user_text;

-- 2. Testar inserção correta
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

-- 3. Verificar se foi inserido
SELECT * FROM user_payment_cards WHERE user_id = auth.uid()::text;

























