-- 🔧 CORREÇÃO DEFINITIVA - POLÍTICAS RLS PARA ENVIO DE MENSAGENS
-- Execute este script no Supabase SQL Editor para resolver os erros de envio

-- 1. Verificar status atual das políticas
SELECT 
    'Status atual das políticas' AS info,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- 2. Remover políticas conflitantes existentes
DROP POLICY IF EXISTS "Chat messages policy" ON messages;
DROP POLICY IF EXISTS "Allow all operations on messages" ON messages;
DROP POLICY IF EXISTS "Enable all for authenticated users on messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;

-- 3. Garantir que RLS está habilitado
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas corretas para messages
-- Política para SELECT (ler mensagens) - usuários autenticados podem ler mensagens de conversas que participam
CREATE POLICY "Users can view messages from their conversations" ON messages
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()::text
        )
    );

-- Política para INSERT (enviar mensagens) - usuários autenticados podem enviar mensagens para conversas que participam
CREATE POLICY "Users can send messages to their conversations" ON messages
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND sender_id = auth.uid()::text
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()::text
        )
    );

-- Política para UPDATE (atualizar mensagens) - usuários podem atualizar apenas suas próprias mensagens
CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL 
        AND sender_id = auth.uid()::text
    )
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND sender_id = auth.uid()::text
    );

-- 5. Verificar se as políticas foram criadas corretamente
SELECT 
    'Políticas criadas para messages' AS info,
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN '📖 Leitura'
        WHEN cmd = 'INSERT' THEN '➕ Inserção'
        WHEN cmd = 'UPDATE' THEN '✏️ Atualização'
        WHEN cmd = 'DELETE' THEN '🗑️ Exclusão'
        ELSE cmd
    END AS operacao
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd, policyname;

-- 6. Verificar se RLS está habilitado
SELECT 
    'Status RLS' AS info,
    relname AS tabela,
    CASE 
        WHEN relrowsecurity THEN '🔒 RLS Habilitado'
        ELSE '🔓 RLS Desabilitado'
    END AS status_rls
FROM pg_class 
WHERE relname = 'messages';

-- 7. Testar se auth.uid() está funcionando
SELECT 
    'Teste de autenticação' AS info,
    auth.uid() as current_user_id,
    auth.uid()::text as current_user_text,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ Usuário autenticado'
        ELSE '❌ Usuário não autenticado'
    END AS auth_status;

-- 8. Verificar se existem conversas para teste
SELECT 
    'Conversas disponíveis' AS info,
    COUNT(*) as total_conversations
FROM conversations;

-- 9. Verificar se existem participantes para teste
SELECT 
    'Participantes disponíveis' AS info,
    COUNT(*) as total_participants
FROM conversation_participants;

-- 10. Resumo final
SELECT 
    '🎉 CORREÇÃO CONCLUÍDA' AS info,
    'Políticas RLS corrigidas para envio de mensagens' AS resultado;























