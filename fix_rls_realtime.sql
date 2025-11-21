-- Script para corrigir RLS e garantir funcionamento do Realtime
-- Execute este script para resolver problemas de Row Level Security

-- 1. Habilitar RLS em todas as tabelas de chat
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas básicas para permitir operações de chat
-- Política para messages - permitir leitura e escrita para participantes
CREATE POLICY "Chat messages policy" ON messages
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()::text
    )
);

-- Política para conversations - permitir leitura para participantes
CREATE POLICY "Chat conversations policy" ON conversations
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()::text
    )
);

-- Política para conversations - permitir inserção para usuários autenticados
CREATE POLICY "Chat conversations insert policy" ON conversations
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para conversation_participants - permitir leitura e escrita para participantes
CREATE POLICY "Chat participants policy" ON conversation_participants
FOR ALL USING (
    user_id = auth.uid()::text OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp2
        WHERE cp2.conversation_id = conversation_participants.conversation_id
        AND cp2.user_id = auth.uid()::text
    )
);

-- 3. Verificar se as políticas foram criadas
SELECT 
    'Políticas criadas para messages' AS info,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

SELECT 
    'Políticas criadas para conversations' AS info,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

SELECT 
    'Políticas criadas para conversation_participants' AS info,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'conversation_participants'
ORDER BY policyname;

-- 4. Verificar status final do RLS
SELECT 
    'Status final RLS' AS info,
    relname AS tabela,
    CASE 
        WHEN relrowsecurity THEN '🔒 RLS Habilitado'
        ELSE '🔓 RLS Desabilitado'
    END AS status_rls
FROM pg_class 
WHERE relname IN ('messages', 'conversations', 'conversation_participants')
ORDER BY relname;

-- 5. Verificar se as tabelas ainda estão na publicação
SELECT 
    'Verificação final - Tabelas na publicação' AS info,
    tablename,
    CASE 
        WHEN tablename = 'messages' THEN '📨 Messages'
        WHEN tablename = 'conversations' THEN '💬 Conversations'
        WHEN tablename = 'conversation_participants' THEN '👥 Participants'
        ELSE tablename
    END AS descricao
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversations', 'conversation_participants')
ORDER BY tablename;

-- 6. Resumo final
SELECT 
    '🎉 CORREÇÃO CONCLUÍDA' AS info,
    'RLS habilitado e políticas criadas para todas as tabelas de chat' AS resultado;
