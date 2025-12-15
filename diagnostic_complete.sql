-- DIAGNÓSTICO COMPLETO DO PROBLEMA
-- Execute este SQL no Supabase SQL Editor para investigar

-- 1. Verificar estrutura da tabela messages
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 2. Verificar se existem múltiplas funções ainda
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    p.oid
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('send_message', 'mark_message_as_read', 'get_conversation_messages')
AND n.nspname = 'public'
ORDER BY p.proname, p.oid;

-- 3. Verificar RLS (Row Level Security) na tabela messages
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrls
FROM pg_tables 
WHERE tablename = 'messages';

-- 4. Verificar políticas RLS na tabela messages
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'messages';

-- 5. Testar inserção direta na tabela messages
INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    message_type,
    attachment_url,
    file_name,
    file_size,
    reply_to_message_id,
    sent_at
) VALUES (
    (SELECT id FROM conversations LIMIT 1),
    auth.uid(),
    'Teste de inserção direta',
    'text',
    NULL,
    NULL,
    NULL,
    NULL,
    NOW()
) RETURNING id, content, sent_at;

-- 6. Verificar se a inserção funcionou
SELECT id, content, sent_at, file_name, file_size 
FROM messages 
WHERE content = 'Teste de inserção direta'
ORDER BY sent_at DESC 
LIMIT 5;


















