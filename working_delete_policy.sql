-- POLÍTICA DE EXCLUSÃO QUE FUNCIONA - SEM PROBLEMAS DE TIPO
-- Execute este SQL no Supabase SQL Editor

-- Passo 1: Limpar políticas existentes
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;
DROP POLICY IF EXISTS "Allow users to delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all operations on conversations" ON conversations;
DROP POLICY IF EXISTS "Allow authenticated users to manage conversations" ON conversations;

-- Passo 2: Criar política funcional
CREATE POLICY "Delete own conversations" ON conversations
    FOR DELETE
    USING (created_by = auth.uid());

-- Passo 3: Verificar resultado
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'conversations' AND cmd = 'DELETE';
























