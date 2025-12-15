-- Script para criar uma conversa de suporte de teste
-- Execute este script no Supabase SQL Editor

-- 1. Criar uma conversa de suporte
INSERT INTO public.conversations (
    id,
    title,
    type,
    status,
    priority,
    created_by,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Suporte - Teste',
    'support',
    'active',
    'normal',
    'yNTB2V36O6WPxVOzlZxLQNV1tCm1',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 2. Adicionar o usuário como participante da conversa
INSERT INTO public.conversation_participants (
    id,
    conversation_id,
    user_id,
    role,
    created_at
) 
SELECT 
    gen_random_uuid(),
    c.id,
    'yNTB2V36O6WPxVOzlZxLQNV1tCm1',
    'client',
    NOW()
FROM public.conversations c
WHERE c.created_by = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1'
AND c.type = 'support'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. Adicionar uma mensagem de teste
INSERT INTO public.messages (
    id,
    conversation_id,
    sender_id,
    content,
    message_type,
    created_at
)
SELECT 
    gen_random_uuid(),
    c.id,
    'yNTB2V36O6WPxVOzlZxLQNV1tCm1',
    'Olá! Esta é uma mensagem de teste.',
    'text',
    NOW()
FROM public.conversations c
WHERE c.created_by = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1'
AND c.type = 'support'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 4. Verificar se foi criado
SELECT 
    c.id,
    c.title,
    c.type,
    c.status,
    c.created_by,
    c.created_at,
    (SELECT COUNT(*) FROM public.messages m WHERE m.conversation_id = c.id) as message_count
FROM public.conversations c
WHERE c.created_by = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1'
AND c.type = 'support'
ORDER BY c.created_at DESC
LIMIT 5;


























