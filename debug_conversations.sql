-- Script para debugar conversas
-- Execute este script no Supabase SQL Editor para verificar se há conversas

-- 1. Verificar se há conversas na tabela
SELECT 
    id,
    title,
    type,
    status,
    created_by,
    created_at,
    updated_at
FROM public.conversations 
ORDER BY updated_at DESC
LIMIT 10;

-- 2. Verificar participantes
SELECT 
    cp.id,
    cp.conversation_id,
    cp.user_id,
    cp.role,
    c.title as conversation_title
FROM public.conversation_participants cp
JOIN public.conversations c ON cp.conversation_id = c.id
ORDER BY cp.created_at DESC
LIMIT 10;

-- 3. Verificar mensagens
SELECT 
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.message_type,
    m.file_url,
    m.file_name,
    m.file_size,
    m.created_at,
    c.title as conversation_title
FROM public.messages m
JOIN public.conversations c ON m.conversation_id = c.id
ORDER BY m.created_at DESC
LIMIT 10;

-- 4. Verificar se a função get_user_conversations existe
SELECT 
    proname as function_name,
    proargnames as argument_names,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'get_user_conversations';

-- 5. Testar consulta direta para um usuário específico (substitua pelo UID do usuário)
-- SELECT * FROM public.conversations 
-- WHERE created_by = 'SEU_UID_AQUI' 
-- OR id IN (
--     SELECT conversation_id 
--     FROM public.conversation_participants 
--     WHERE user_id = 'SEU_UID_AQUI'
-- );


























