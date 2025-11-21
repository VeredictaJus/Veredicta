-- Script para verificar status do RLS na tabela
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se RLS está habilitado na tabela
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls
FROM pg_tables 
WHERE tablename = 'user_payment_cards';

-- 2. Verificar políticas ativas
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_payment_cards';

-- 3. Verificar usuário autenticado
SELECT 
    auth.uid() as auth_uid,
    auth.uid()::text as auth_uid_text;

-- 4. Se RLS não estiver habilitado, habilitar
-- (Descomente se necessário)
/*
ALTER TABLE user_payment_cards ENABLE ROW LEVEL SECURITY;
*/

-- 5. Verificar novamente se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_payment_cards';

























