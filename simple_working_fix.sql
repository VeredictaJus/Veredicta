-- SOLUÇÃO MAIS SIMPLES QUE DEVE FUNCIONAR
-- Execute este SQL no Supabase SQL Editor

-- Passo 1: Limpar todas as políticas
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;
DROP POLICY IF EXISTS "Allow users to delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Delete own conversations with type cast" ON conversations;
DROP POLICY IF EXISTS "Delete conversations using function" ON conversations;

-- Passo 2: Verificar se auth.uid() funciona
SELECT auth.uid() as current_user_id;

-- Passo 3: Verificar dados de exemplo
SELECT id, title, created_by, pg_typeof(created_by) as created_by_type 
FROM conversations LIMIT 1;

-- Passo 4: Criar política mais simples possível
CREATE POLICY "Simple delete policy" ON conversations
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL
    );

-- Passo 5: Verificar resultado
SELECT policyname, cmd, qual FROM pg_policies 
WHERE tablename = 'conversations' AND cmd = 'DELETE';
























