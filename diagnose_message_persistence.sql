-- DIAGNÓSTICO COMPLETO - POR QUE MENSAGENS NÃO PERSISTEM?
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a função send_message_v2 existe
SELECT '=== VERIFICAR FUNÇÃO send_message_v2 ===' as info;
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'send_message_v2'
AND n.nspname = 'public';

-- 2. Verificar se a função get_conversation_messages_v2 existe
SELECT '=== VERIFICAR FUNÇÃO get_conversation_messages_v2 ===' as info;
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_conversation_messages_v2'
AND n.nspname = 'public';

-- 3. Verificar estrutura da tabela messages
SELECT '=== ESTRUTURA DA TABELA messages ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 4. Verificar se existem mensagens na tabela
SELECT '=== TOTAL DE MENSAGENS NA TABELA ===' as info;
SELECT COUNT(*) as total_mensagens FROM messages;

-- 5. Ver últimas 10 mensagens inseridas
SELECT '=== ÚLTIMAS 10 MENSAGENS ===' as info;
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    message_type,
    file_name,
    file_size,
    sent_at,
    created_at
FROM messages
ORDER BY COALESCE(sent_at, created_at) DESC
LIMIT 10;

-- 6. Verificar mensagens da conversa de suporte
SELECT '=== MENSAGENS DA CONVERSA DE SUPORTE ===' as info;
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    message_type,
    file_name,
    sent_at,
    created_at
FROM messages
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY COALESCE(sent_at, created_at) ASC;

-- 7. Testar a função send_message_v2
SELECT '=== TESTAR send_message_v2 ===' as info;
SELECT send_message_v2(
    '550e8400-e29b-41d4-a716-446655440000', -- UUID da conversa de suporte
    'test-firebase-uid-123',
    'Mensagem de teste para diagnóstico',
    'text',
    NULL,
    NULL,
    NULL,
    NULL
) as new_message_id;

-- 8. Verificar se a mensagem de teste foi inserida
SELECT '=== VERIFICAR MENSAGEM DE TESTE ===' as info;
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    sent_at,
    created_at
FROM messages
WHERE content = 'Mensagem de teste para diagnóstico'
ORDER BY created_at DESC
LIMIT 1;

-- 9. Testar a função get_conversation_messages_v2
SELECT '=== TESTAR get_conversation_messages_v2 ===' as info;
SELECT * FROM get_conversation_messages_v2('550e8400-e29b-41d4-a716-446655440000');

-- 10. Verificar políticas RLS da tabela messages
SELECT '=== POLÍTICAS RLS DA TABELA messages ===' as info;
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

-- 11. Verificar se RLS está habilitado
SELECT '=== STATUS RLS ===' as info;
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'messages';

-- 12. Tentar inserir diretamente uma mensagem (bypass RPC)
SELECT '=== TESTAR INSERT DIRETO ===' as info;
INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    message_type,
    sent_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'test-direct-insert',
    'Teste de insert direto',
    'text',
    NOW()
) RETURNING id, content, sent_at;

-- 13. Verificar se o insert direto funcionou
SELECT '=== VERIFICAR INSERT DIRETO ===' as info;
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    sent_at
FROM messages
WHERE content = 'Teste de insert direto'
LIMIT 1;

SELECT '=== DIAGNÓSTICO COMPLETO ===' as status;


















