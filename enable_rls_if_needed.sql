-- Script para habilitar RLS se necessário
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_payment_cards';

-- 2. Habilitar RLS se não estiver habilitado
ALTER TABLE user_payment_cards ENABLE ROW LEVEL SECURITY;

-- 3. Verificar novamente
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_payment_cards';

-- 4. Verificar políticas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_payment_cards';

























