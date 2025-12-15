-- SOLUÇÃO DEFINITIVA PARA O ERRO: operator does not exist: text = uuid
-- Execute este SQL no Supabase SQL Editor

-- Passo 1: Verificar o tipo atual da coluna created_by
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name = 'created_by';

-- Passo 2: Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;
DROP POLICY IF EXISTS "Allow users to delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

-- Passo 3: Verificar se auth.uid() retorna uuid
SELECT 
    auth.uid() as current_user_id,
    pg_typeof(auth.uid()) as auth_uid_type,
    pg_typeof(created_by) as created_by_type
FROM conversations 
LIMIT 1;

-- Passo 4: Criar política com conversão de tipos explícita
CREATE POLICY "Allow users to delete their own conversations" ON conversations
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL 
        AND created_by::uuid = auth.uid()
    );

-- Passo 5: Verificar se a política foi criada corretamente
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'conversations' 
AND cmd = 'DELETE';

-- Passo 6: Teste de verificação (opcional)
SELECT 
    id,
    title,
    created_by,
    auth.uid() as current_user_id,
    (created_by::uuid = auth.uid()) as can_delete
FROM conversations
WHERE auth.uid() IS NOT NULL
LIMIT 3;
























