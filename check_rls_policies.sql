-- Script para verificar e corrigir políticas RLS

-- 1. Verificar políticas RLS existentes na tabela user_settings
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 2. Verificar se a tabela tem RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_settings';

-- 3. Verificar se o usuário atual tem permissão para UPDATE
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'user_settings' 
AND grantee = current_user;

-- 4. Se necessário, criar política RLS mais permissiva temporariamente
-- (Execute apenas se as políticas acima mostrarem problemas)

-- Desabilitar RLS temporariamente para teste
-- ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Ou criar política mais permissiva
-- DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
-- CREATE POLICY "Users can update their own settings" ON user_settings
--     FOR UPDATE USING (true)
--     WITH CHECK (true);





















