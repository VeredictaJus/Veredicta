-- Script para testar se o service role está funcionando
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    current_user,
    current_setting('role'),
    session_user;

-- 2. Verificar permissões do usuário atual
SELECT 
    has_table_privilege(current_user, 'user_payment_cards', 'INSERT') as can_insert,
    has_table_privilege(current_user, 'user_payment_cards', 'SELECT') as can_select,
    has_table_privilege(current_user, 'user_payment_cards', 'UPDATE') as can_update,
    has_table_privilege(current_user, 'user_payment_cards', 'DELETE') as can_delete;

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_payment_cards';

-- 4. Tentar inserção como postgres (admin)
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
    '2222',
    'mastercard',
    6,
    2026,
    'Teste Admin Postgres',
    false
) RETURNING *;

























