-- TESTAR FUNÇÃO get_conversation_messages_v2
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a função existe
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as identity_args
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_conversation_messages_v2'
AND n.nspname = 'public';

-- 2. Testar a função com a conversa de suporte
SELECT * FROM get_conversation_messages_v2('550e8400-e29b-41d4-a716-446655440000');

-- 3. Verificar se há mensagens na tabela messages
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    message_type,
    file_name,
    file_size,
    created_at,
    sent_at
FROM messages 
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY sent_at ASC, created_at ASC;

-- 4. Verificar se há mensagens em outras conversas
SELECT 
    conversation_id,
    COUNT(*) as message_count,
    MIN(created_at) as first_message,
    MAX(created_at) as last_message
FROM messages 
GROUP BY conversation_id
ORDER BY last_message DESC;

-- 5. Testar inserção de mensagem de teste
INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    message_type,
    status,
    sent_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'test-firebase-uid',
    'Mensagem de teste para verificar persistência',
    'text',
    'sent',
    NOW()
) ON CONFLICT DO NOTHING;

-- 6. Verificar se a mensagem foi inserida
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    created_at,
    sent_at
FROM messages 
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY sent_at DESC
LIMIT 5;

SELECT 'Teste de mensagens concluído!' as status;


















