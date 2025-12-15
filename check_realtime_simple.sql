-- Script SIMPLES para verificar configuração do Realtime no Supabase
-- Compatível com a versão do PostgreSQL do Supabase

-- 1. Verificar se existem publicações
SELECT 
    'Publicações existentes' AS info,
    pubname,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete
FROM pg_publication;

-- 2. Verificar tabelas na publicação supabase_realtime
SELECT 
    'Tabelas na publicação supabase_realtime' AS info,
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Verificar se as tabelas de chat existem
SELECT 
    'Tabelas de chat existentes' AS info,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name IN ('messages', 'conversations', 'conversation_participants')
AND table_schema = 'public'
ORDER BY table_name;

-- 4. Verificar políticas RLS nas tabelas de chat
SELECT 
    'Políticas RLS - messages' AS info,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

SELECT 
    'Políticas RLS - conversations' AS info,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

SELECT 
    'Políticas RLS - conversation_participants' AS info,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'conversation_participants'
ORDER BY policyname;

-- 5. Verificar se RLS está habilitado
SELECT 
    'Status RLS - messages' AS info,
    relname,
    relrowsecurity
FROM pg_class 
WHERE relname = 'messages';

SELECT 
    'Status RLS - conversations' AS info,
    relname,
    relrowsecurity
FROM pg_class 
WHERE relname = 'conversations';

SELECT 
    'Status RLS - conversation_participants' AS info,
    relname,
    relrowsecurity
FROM pg_class 
WHERE relname = 'conversation_participants';

-- 6. Verificar configurações do Realtime
SELECT 
    'Configurações do Realtime' AS info,
    name,
    setting,
    unit
FROM pg_settings 
WHERE name IN ('max_replication_slots', 'max_wal_senders', 'wal_level')
ORDER BY name;
