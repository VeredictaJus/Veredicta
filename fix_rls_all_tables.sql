-- Script para corrigir RLS em todas as tabelas de chat
-- Remove políticas restritivas e cria políticas mais permissivas

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Enable all for authenticated users on messages" ON messages;
DROP POLICY IF EXISTS "Enable all for authenticated users on conversations" ON conversations;
DROP POLICY IF EXISTS "Enable all for authenticated users on conversation_participants" ON conversation_participants;

-- 2. Criar políticas permissivas para todas as tabelas
-- Política para messages - totalmente permissiva
CREATE POLICY "Allow all operations on messages" ON messages
FOR ALL USING (true) WITH CHECK (true);

-- Política para conversations - totalmente permissiva
CREATE POLICY "Allow all operations on conversations" ON conversations
FOR ALL USING (true) WITH CHECK (true);

-- Política para conversation_participants - totalmente permissiva
CREATE POLICY "Allow all operations on conversation_participants" ON conversation_participants
FOR ALL USING (true) WITH CHECK (true);

-- 3. Verificar se as políticas foram criadas
SELECT 
    'Políticas para messages' AS tabela,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

SELECT 
    'Políticas para conversations' AS tabela,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

SELECT 
    'Políticas para conversation_participants' AS tabela,
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

-- 5. Verificar se as tabelas estão na publicação do Realtime
SELECT 
    'Verificação final - Tabelas na publicação' AS info,
    tablename,
    CASE 
        WHEN tablename = 'messages' THEN '📨 Messages'
        WHEN tablename = 'conversations' THEN '💬 Conversations'
        WHEN tablename = 'conversation_participants' THEN '👥 Participants'
        ELSE tablename
    END AS descricao,
    '✅ Na publicação' AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversations', 'conversation_participants')
ORDER BY tablename;

-- 6. Resumo final
SELECT 
    '🎉 CORREÇÃO COMPLETA APLICADA' AS info,
    'RLS configurado com políticas permissivas para todas as tabelas de chat' AS resultado;
