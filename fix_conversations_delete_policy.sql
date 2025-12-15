-- SOLUÇÃO DEFINITIVA PARA EXCLUSÃO DE CONVERSAS
-- Execute este SQL no Supabase SQL Editor

-- Passo 1: Remover todas as políticas de DELETE existentes
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Enable delete for users based on created_by" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations" ON conversations;

-- Passo 2: Criar política simples e funcional
CREATE POLICY "Allow users to delete their own conversations" ON conversations
    FOR DELETE
    USING (created_by = auth.uid());

-- Passo 3: Garantir que RLS está ativo
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Passo 4: Verificar se funcionou
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'conversations' AND cmd = 'DELETE';
























