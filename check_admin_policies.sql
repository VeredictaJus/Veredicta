-- Script para verificar políticas de admin
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    current_user,
    current_setting('role'),
    auth.uid() as auth_uid;

-- 2. Verificar políticas atuais
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_payment_cards';

-- 3. Verificar se postgres pode inserir
SELECT 
    has_table_privilege('postgres', 'user_payment_cards', 'INSERT') as can_insert,
    has_table_privilege('postgres', 'user_payment_cards', 'SELECT') as can_select;

-- 4. Testar inserção direta (bypass RLS)
SET row_security = off;
INSERT INTO user_payment_cards (
    user_id,
    last_four,
    brand,
    expiry_month,
    expiry_year,
    holder_name,
    is_default
) VALUES (
    'YNTB2V3606WPxV0zlZxLQNV1tCm1',
    '5678',
    'mastercard',
    6,
    2026,
    'Teste Bypass RLS',
    false
) RETURNING *;
SET row_security = on;

-- 5. Verificar inserção
SELECT * FROM user_payment_cards WHERE holder_name = 'Teste Bypass RLS';

























