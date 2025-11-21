-- Script para verificar e corrigir políticas RLS da tabela user_settings
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela user_settings existe
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_settings';

-- 2. Verificar políticas existentes na tabela user_settings
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

-- 3. Verificar estrutura da tabela user_settings
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position;

-- 4. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;

-- 5. Criar políticas corretas para user_settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 6. Verificar se as políticas foram criadas
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_settings'
ORDER BY policyname;
