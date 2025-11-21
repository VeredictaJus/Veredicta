-- 🔧 CORREÇÃO DEFINITIVA - POLÍTICAS RLS PARA CONVERSAS E PARTICIPANTES
-- Execute este script no Supabase SQL Editor para resolver problemas de conversas

-- 1. Verificar status atual das políticas de conversas
SELECT 
    'Status atual das políticas de conversas' AS info,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants')
ORDER BY tablename, policyname;

-- 2. Remover políticas conflitantes existentes para conversations
DROP POLICY IF EXISTS "Chat conversations policy" ON conversations;
DROP POLICY IF EXISTS "Chat conversations insert policy" ON conversations;
DROP POLICY IF EXISTS "Allow all operations on conversations" ON conversations;
DROP POLICY IF EXISTS "Enable all for authenticated users on conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;
DROP POLICY IF EXISTS "Users can manage their conversations" ON conversations;

-- 3. Remover políticas conflitantes existentes para conversation_participants
DROP POLICY IF EXISTS "Chat participants policy" ON conversation_participants;
DROP POLICY IF EXISTS "Allow all operations on conversation_participants" ON conversation_participants;
DROP POLICY IF EXISTS "Enable all for authenticated users on conversation_participants" ON conversation_participants;

-- 4. Garantir que RLS está habilitado
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas corretas para conversations
-- Política para SELECT (ler conversas) - usuários podem ver conversas que participam
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversations.id
            AND cp.user_id = auth.uid()::text
        )
    );

-- Política para INSERT (criar conversas) - usuários autenticados podem criar conversas
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()::text
    );

-- Política para UPDATE (atualizar conversas) - usuários podem atualizar conversas que criaram
CREATE POLICY "Users can update conversations they created" ON conversations
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()::text
    )
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()::text
    );

-- Política para DELETE (excluir conversas) - usuários podem excluir conversas que criaram
CREATE POLICY "Users can delete conversations they created" ON conversations
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()::text
    );

-- 6. Criar políticas corretas para conversation_participants
-- Política para SELECT (ler participantes) - usuários podem ver participantes de conversas que participam
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL 
        AND (
            user_id = auth.uid()::text 
            OR EXISTS (
                SELECT 1 FROM conversation_participants cp2
                WHERE cp2.conversation_id = conversation_participants.conversation_id
                AND cp2.user_id = auth.uid()::text
            )
        )
    );

-- Política para INSERT (adicionar participantes) - usuários podem adicionar participantes a conversas que criaram
CREATE POLICY "Users can add participants to their conversations" ON conversation_participants
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_participants.conversation_id
            AND c.created_by = auth.uid()::text
        )
    );

-- Política para UPDATE (atualizar participantes) - usuários podem atualizar participantes de conversas que criaram
CREATE POLICY "Users can update participants of their conversations" ON conversation_participants
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_participants.conversation_id
            AND c.created_by = auth.uid()::text
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_participants.conversation_id
            AND c.created_by = auth.uid()::text
        )
    );

-- Política para DELETE (remover participantes) - usuários podem remover participantes de conversas que criaram
CREATE POLICY "Users can remove participants from their conversations" ON conversation_participants
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_participants.conversation_id
            AND c.created_by = auth.uid()::text
        )
    );

-- 7. Verificar se as políticas foram criadas corretamente para conversations
SELECT 
    'Políticas criadas para conversations' AS info,
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
WHERE tablename = 'conversations'
ORDER BY cmd, policyname;

-- 8. Verificar se as políticas foram criadas corretamente para conversation_participants
SELECT 
    'Políticas criadas para conversation_participants' AS info,
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
WHERE tablename = 'conversation_participants'
ORDER BY cmd, policyname;

-- 9. Verificar status RLS de todas as tabelas de chat
SELECT 
    'Status RLS das tabelas de chat' AS info,
    relname AS tabela,
    CASE 
        WHEN relrowsecurity THEN '🔒 RLS Habilitado'
        ELSE '🔓 RLS Desabilitado'
    END AS status_rls
FROM pg_class 
WHERE relname IN ('messages', 'conversations', 'conversation_participants')
ORDER BY relname;

-- 10. Teste de verificação final
SELECT 
    'Teste de autenticação' AS info,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ Usuário autenticado'
        ELSE '❌ Usuário não autenticado'
    END AS auth_status;

-- 11. Resumo final
SELECT 
    '🎉 CORREÇÃO CONCLUÍDA' AS info,
    'Políticas RLS corrigidas para conversas e participantes' AS resultado;























