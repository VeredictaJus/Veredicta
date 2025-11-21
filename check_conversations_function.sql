-- Verificar se a função get_user_conversations existe
SELECT 
    proname as function_name,
    proargnames as argument_names,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'get_user_conversations';

-- Verificar se há conversas na tabela conversations
SELECT 
    id,
    title,
    type,
    status,
    created_by,
    created_at
FROM public.conversations 
ORDER BY created_at DESC
LIMIT 10;

-- Verificar se há participantes nas conversas
SELECT 
    cp.id,
    cp.conversation_id,
    cp.user_id,
    cp.role,
    c.title as conversation_title,
    c.type as conversation_type
FROM public.conversation_participants cp
JOIN public.conversations c ON cp.conversation_id = c.id
ORDER BY cp.created_at DESC
LIMIT 10;

-- Verificar se há mensagens
SELECT 
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.message_type,
    m.created_at,
    c.title as conversation_title
FROM public.messages m
JOIN public.conversations c ON m.conversation_id = c.id
ORDER BY m.created_at DESC
LIMIT 10;


























