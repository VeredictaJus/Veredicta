-- SOLUÇÃO DEFINITIVA - SEM ERRO DE TIPOS
-- Execute este SQL no Supabase SQL Editor

-- Passo 1: Limpar todas as políticas existentes
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;
DROP POLICY IF EXISTS "Allow users to delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all operations on conversations" ON conversations;
DROP POLICY IF EXISTS "Allow authenticated users to manage conversations" ON conversations;

-- Passo 2: Verificar o tipo da coluna created_by
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'conversations' AND column_name = 'created_by';

-- Passo 3: Criar política com conversão de tipos correta
CREATE POLICY "Delete own conversations with type cast" ON conversations
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL 
        AND created_by::uuid = auth.uid()
    );

-- Passo 4: Verificar se funcionou
SELECT policyname, cmd, qual FROM pg_policies 
WHERE tablename = 'conversations' AND cmd = 'DELETE';
























