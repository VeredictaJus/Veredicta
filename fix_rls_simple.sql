-- CORREÇÃO SIMPLES DAS POLÍTICAS RLS PARA EXCLUSÃO DE CONVERSAS
-- Execute este SQL no Supabase SQL Editor

-- 1. Primeiro, vamos verificar as políticas atuais (corrigido)
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
WHERE tablename = 'conversations'
ORDER BY policyname;

-- 2. Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Enable delete for users based on created_by" ON conversations;

-- 3. Criar política correta para exclusão de conversas
-- Permitir que usuários excluam conversas que eles criaram
CREATE POLICY "Users can delete conversations they created" ON conversations
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL 
        AND created_by::text = auth.uid()::text
    );

-- 4. Verificar se RLS está habilitado
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se as políticas foram criadas corretamente
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
WHERE tablename = 'conversations'
ORDER BY policyname;

-- 6. Teste simples - verificar conversas do usuário atual
SELECT 
    id,
    title,
    created_by,
    auth.uid() as current_user_id,
    (created_by::text = auth.uid()::text) as can_delete
FROM conversations
WHERE auth.uid() IS NOT NULL
LIMIT 5;