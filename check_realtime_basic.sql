-- Script BÁSICO para verificar Realtime no Supabase
-- Execute este script primeiro para diagnóstico básico

-- 1. Verificar se a publicação supabase_realtime existe
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') 
        THEN '✅ Publicação supabase_realtime existe'
        ELSE '❌ Publicação supabase_realtime NÃO existe'
    END AS status_publicacao;

-- 2. Verificar se as tabelas de chat estão na publicação
SELECT 
    'Tabelas de chat na publicação supabase_realtime' AS info,
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

-- 3. Verificar se as tabelas existem
SELECT 
    'Tabelas de chat existentes' AS info,
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

-- 4. Verificar RLS habilitado
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

-- 5. Resumo final
SELECT 
    'RESUMO FINAL' AS info,
    'Verifique os resultados acima para identificar problemas' AS instrucao;
