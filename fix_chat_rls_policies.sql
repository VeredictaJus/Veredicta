-- 🔧 Correção das Políticas RLS para Chat (Arquivar e Excluir)
-- Este script corrige as políticas RLS para permitir que usuários arquivem e excluam suas próprias conversas

-- 1. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename, policyname;

-- 2. Dropar políticas existentes para conversations (se existirem)
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

-- 3. Criar políticas corretas para conversations
-- Política para SELECT (visualizar conversas)
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT
    USING (created_by = (auth.uid())::text);

-- Política para INSERT (criar conversas)
CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT
    WITH CHECK (created_by = (auth.uid())::text);

-- Política para UPDATE (atualizar conversas - inclui arquivar)
CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE
    USING (created_by = (auth.uid())::text)
    WITH CHECK (created_by = (auth.uid())::text);

-- Política para DELETE (excluir conversas)
CREATE POLICY "Users can delete their own conversations" ON conversations
    FOR DELETE
    USING (created_by = (auth.uid())::text);

-- 4. Dropar políticas existentes para messages (se existirem)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON messages;

-- 5. Criar políticas corretas para messages
-- Política para SELECT (visualizar mensagens)
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.created_by = (auth.uid())::text
        )
    );

-- Política para INSERT (enviar mensagens)
CREATE POLICY "Users can insert messages in their conversations" ON messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.created_by = (auth.uid())::text
        )
    );

-- Política para UPDATE (editar mensagens)
CREATE POLICY "Users can update messages in their conversations" ON messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.created_by = (auth.uid())::text
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.created_by = (auth.uid())::text
        )
    );

-- Política para DELETE (excluir mensagens)
CREATE POLICY "Users can delete messages in their conversations" ON messages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.created_by = (auth.uid())::text
        )
    );

-- 6. Dropar políticas existentes para conversation_participants (se existirem)
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete participants in their conversations" ON conversation_participants;

-- 7. Criar políticas corretas para conversation_participants
-- Política para SELECT (visualizar participantes)
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = conversation_participants.conversation_id 
            AND conversations.created_by = (auth.uid())::text
        )
    );

-- Política para INSERT (adicionar participantes)
CREATE POLICY "Users can insert participants in their conversations" ON conversation_participants
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = conversation_participants.conversation_id 
            AND conversations.created_by = (auth.uid())::text
        )
    );

-- Política para UPDATE (atualizar participantes)
CREATE POLICY "Users can update participants in their conversations" ON conversation_participants
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = conversation_participants.conversation_id 
            AND conversations.created_by = (auth.uid())::text
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = conversation_participants.conversation_id 
            AND conversations.created_by = (auth.uid())::text
        )
    );

-- Política para DELETE (remover participantes)
CREATE POLICY "Users can delete participants in their conversations" ON conversation_participants
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = conversation_participants.conversation_id 
            AND conversations.created_by = (auth.uid())::text
        )
    );

-- 8. Verificar se RLS está habilitado
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 9. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename, policyname;

-- 10. Teste de verificação
-- Verificar se o usuário pode ver suas conversas
SELECT 
    id, 
    title, 
    status, 
    created_by,
    (auth.uid())::text as current_user_uid,
    CASE 
        WHEN created_by = (auth.uid())::text THEN '✅ PODE GERENCIAR'
        ELSE '❌ NÃO PODE GERENCIAR'
    END as permission_status
FROM conversations 
ORDER BY created_at DESC
LIMIT 5;
























