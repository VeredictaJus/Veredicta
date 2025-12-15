-- ALTERNATIVA - USAR FUNÇÃO PARA EVITAR PROBLEMAS DE TIPO
-- Execute este SQL no Supabase SQL Editor

-- Passo 1: Limpar políticas existentes
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;
DROP POLICY IF EXISTS "Allow users to delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Delete own conversations with type cast" ON conversations;

-- Passo 2: Criar função auxiliar para verificar ownership
CREATE OR REPLACE FUNCTION can_delete_conversation(conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id 
    AND created_by::uuid = auth.uid()
  );
END;
$$;

-- Passo 3: Criar política usando a função
CREATE POLICY "Delete conversations using function" ON conversations
    FOR DELETE
    USING (can_delete_conversation(id));

-- Passo 4: Verificar se funcionou
SELECT policyname, cmd, qual FROM pg_policies 
WHERE tablename = 'conversations' AND cmd = 'DELETE';
























