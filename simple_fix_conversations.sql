-- SOLUÇÃO MAIS SIMPLES - SEM PROBLEMAS DE TIPO
-- Execute este SQL no Supabase SQL Editor

-- Passo 1: Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;
DROP POLICY IF EXISTS "Allow users to delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all operations on conversations" ON conversations;
DROP POLICY IF EXISTS "Allow authenticated users to manage conversations" ON conversations;

-- Passo 2: Criar política simples usando função
CREATE POLICY "Simple delete policy" ON conversations
    FOR DELETE
    USING (
        auth.uid() = (SELECT created_by FROM conversations WHERE id = conversations.id)
    );

-- Passo 3: Verificar se funcionou
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'conversations' 
AND cmd = 'DELETE';
























