-- Script AVANÇADO para debugar problemas do Realtime
-- Execute este script para diagnóstico completo

-- 1. Verificar se o Realtime está funcionando
SELECT 
    'VERIFICAÇÃO BÁSICA DO REALTIME' AS secao,
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') 
        THEN '✅ Publicação supabase_realtime existe'
        ELSE '❌ Publicação supabase_realtime NÃO existe'
    END AS status;

-- 2. Verificar tabelas na publicação
SELECT 
    'TABELAS NA PUBLICAÇÃO' AS secao,
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

-- 3. Verificar se as tabelas existem e têm dados
SELECT 
    'EXISTÊNCIA DAS TABELAS' AS secao,
    table_name,
    CASE 
        WHEN table_name = 'messages' THEN '📨 Messages'
        WHEN table_name = 'conversations' THEN '💬 Conversations'
        WHEN table_name = 'conversation_participants' THEN '👥 Participants'
        ELSE table_name
    END AS descricao
FROM information_schema.tables 
WHERE table_name IN ('messages', 'conversations', 'conversation_participants')
AND table_schema = 'public'
ORDER BY table_name;

-- 4. Verificar estrutura da tabela messages
SELECT 
    'ESTRUTURA DA TABELA MESSAGES' AS secao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messages'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar políticas RLS
SELECT 
    'POLÍTICAS RLS - MESSAGES' AS secao,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- 6. Verificar se RLS está habilitado
SELECT 
    'STATUS RLS' AS secao,
    relname AS tabela,
    CASE 
        WHEN relrowsecurity THEN '🔒 RLS Habilitado'
        ELSE '🔓 RLS Desabilitado'
    END AS status_rls
FROM pg_class 
WHERE relname IN ('messages', 'conversations', 'conversation_participants')
ORDER BY relname;

-- 7. Verificar configurações do PostgreSQL
SELECT 
    'CONFIGURAÇÕES POSTGRESQL' AS secao,
    name,
    setting,
    unit,
    context
FROM pg_settings 
WHERE name IN (
    'max_replication_slots',
    'max_wal_senders', 
    'wal_level',
    'hot_standby',
    'logical_replication'
)
ORDER BY name;

-- 8. Verificar slots de replicação
SELECT 
    'SLOTS DE REPLICAÇÃO' AS secao,
    slot_name,
    plugin,
    slot_type,
    active,
    xmin,
    catalog_xmin
FROM pg_replication_slots
WHERE slot_name LIKE '%realtime%' OR slot_name LIKE '%supabase%'
ORDER BY slot_name;

-- 9. Verificar estatísticas de WAL
SELECT 
    'ESTATÍSTICAS WAL' AS secao,
    wal_records,
    wal_fpi,
    wal_bytes,
    wal_buffers_full,
    wal_write,
    wal_sync,
    wal_write_time,
    wal_sync_time
FROM pg_stat_wal;

-- 10. Teste de inserção (opcional - descomente se necessário)
/*
-- TESTE: Inserir uma mensagem de teste
INSERT INTO messages (conversation_id, sender_id, content, message_type)
VALUES (
    (SELECT id FROM conversations LIMIT 1),
    'test-user',
    'Teste de Realtime - ' || NOW(),
    'text'
);
*/

-- 11. Resumo final
SELECT 
    'RESUMO FINAL' AS secao,
    'Analise os resultados acima para identificar problemas' AS instrucao;
