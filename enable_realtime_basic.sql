-- Script BÁSICO para habilitar Realtime no Supabase
-- Execute este script se as tabelas não estiverem na publicação

-- 1. Verificar se a publicação existe
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') 
        THEN '✅ Publicação supabase_realtime já existe'
        ELSE '❌ Criando publicação supabase_realtime...'
    END AS status;

-- 2. Criar publicação se não existir (descomente se necessário)
-- CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- 3. Adicionar tabelas à publicação (execute apenas se necessário)
-- Adicionar messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
        RAISE NOTICE '✅ Tabela messages adicionada à publicação';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela messages já está na publicação';
    END IF;
END $$;

-- Adicionar conversations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
        RAISE NOTICE '✅ Tabela conversations adicionada à publicação';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela conversations já está na publicação';
    END IF;
END $$;

-- Adicionar conversation_participants
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'conversation_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
        RAISE NOTICE '✅ Tabela conversation_participants adicionada à publicação';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela conversation_participants já está na publicação';
    END IF;
END $$;

-- 4. Verificar resultado final
SELECT 
    'VERIFICAÇÃO FINAL' AS info,
    tablename,
    CASE 
        WHEN tablename = 'messages' THEN '📨 Messages'
        WHEN tablename = 'conversations' THEN '💬 Conversations'
        WHEN tablename = 'conversation_participants' THEN '👥 Participants'
        ELSE tablename
    END AS descricao,
    '✅ Habilitado para Realtime' AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversations', 'conversation_participants')
ORDER BY tablename;

-- 5. Resumo final
SELECT 
    '🎉 CONFIGURAÇÃO CONCLUÍDA' AS info,
    'As tabelas de chat agora estão habilitadas para Realtime' AS resultado;
