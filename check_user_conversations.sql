-- Script para verificar conversas do usuário específico
-- Substitua 'SEU_UID_AQUI' pelo UID real do usuário

-- 1. Verificar todas as conversas
SELECT 
    'Todas as conversas' as tipo,
    COUNT(*) as quantidade
FROM public.conversations;

-- 2. Verificar conversas criadas pelo usuário específico
SELECT 
    'Conversas criadas pelo usuário' as tipo,
    COUNT(*) as quantidade
FROM public.conversations 
WHERE created_by = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1';

-- 3. Verificar participantes do usuário específico
SELECT 
    'Participações do usuário' as tipo,
    COUNT(*) as quantidade
FROM public.conversation_participants 
WHERE user_id = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1';

-- 4. Verificar mensagens do usuário específico
SELECT 
    'Mensagens do usuário' as tipo,
    COUNT(*) as quantidade
FROM public.messages 
WHERE sender_id = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1';

-- 5. Verificar se há conversas de suporte
SELECT 
    'Conversas de suporte' as tipo,
    COUNT(*) as quantidade
FROM public.conversations 
WHERE type = 'support';

-- 6. Verificar conversas de suporte com o usuário específico
SELECT 
    c.id,
    c.title,
    c.type,
    c.status,
    c.created_by,
    c.created_at,
    c.updated_at
FROM public.conversations c
WHERE c.type = 'support'
AND (
    c.created_by = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1'
    OR c.id IN (
        SELECT conversation_id 
        FROM public.conversation_participants 
        WHERE user_id = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1'
    )
)
ORDER BY c.updated_at DESC;

-- 7. Verificar mensagens de suporte
SELECT 
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.message_type,
    m.created_at,
    c.title as conversation_title,
    c.type as conversation_type
FROM public.messages m
JOIN public.conversations c ON m.conversation_id = c.id
WHERE c.type = 'support'
AND (
    c.created_by = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1'
    OR c.id IN (
        SELECT conversation_id 
        FROM public.conversation_participants 
        WHERE user_id = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1'
    )
)
ORDER BY m.created_at DESC
LIMIT 10;


























