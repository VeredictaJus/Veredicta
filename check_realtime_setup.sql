-- Script para verificar configuração do Realtime no Supabase

-- 1. Verificar se a tabela messages está habilitada para Realtime
SELECT 
    'Configuração Realtime da tabela messages' AS info,
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE tablename = 'messages';

-- 2. Verificar publicações ativas
SELECT 
    'Publicações ativas' AS info,
    pubname,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 3. Verificar se a tabela messages está na publicação
SELECT 
    'Tabelas na publicação supabase_realtime' AS info,
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 4. Verificar permissões RLS na tabela messages
SELECT 
    'Políticas RLS da tabela messages' AS info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- 5. Verificar se RLS está habilitado na tabela messages
SELECT 
    'Status RLS da tabela messages' AS info,
    relname,
    relrowsecurity
FROM pg_class 
WHERE relname = 'messages';

-- 6. Verificar configuração do Realtime
SELECT 
    'Configuração geral do Realtime' AS info,
    name,
    setting,
    unit
FROM pg_settings 
WHERE name LIKE '%realtime%' OR name LIKE '%logical%'
ORDER BY name;
