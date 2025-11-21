-- CORRIGIR CONVERSA DE SUPORTE COM UUID VÁLIDO
-- Execute este SQL no Supabase SQL Editor

-- 1. Primeiro, verificar se já existe uma conversa de suporte
SELECT 
    id, 
    title, 
    type, 
    status, 
    created_by,
    created_at
FROM conversations 
WHERE title ILIKE '%suporte%' OR type = 'support'
ORDER BY created_at DESC;

-- 2. Se não existir, criar a conversa de suporte com UUID real
-- Usar um UUID fixo para a conversa de suporte
INSERT INTO conversations (
    id,
    title,
    type,
    status,
    priority,
    created_by,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000', -- UUID fixo para suporte
    'Suporte Veredicta',
    'support',
    'active',
    'normal',
    '550e8400-e29b-41d4-a716-446655440001', -- UUID do sistema
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se o usuário atual é participante da conversa de suporte
-- (Substitua 'USER_FIREBASE_UID' pelo UID real do usuário)
SELECT 
    cp.conversation_id,
    cp.user_id,
    cp.role,
    cp.joined_at
FROM conversation_participants cp
WHERE cp.conversation_id = '550e8400-e29b-41d4-a716-446655440000';

-- 4. Adicionar o usuário atual como participante se não estiver
-- (Substitua 'USER_FIREBASE_UID' pelo UID real do usuário)
INSERT INTO conversation_participants (
    conversation_id,
    user_id,
    role,
    joined_at,
    last_read_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000', -- UUID da conversa de suporte
    'USER_FIREBASE_UID', -- Substitua pelo UID real
    'client',
    NOW(),
    NOW()
) ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- 5. Verificar mensagens da conversa de suporte
SELECT 
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.message_type,
    m.file_name,
    m.file_size,
    m.created_at,
    m.sent_at
FROM messages m
WHERE m.conversation_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY m.sent_at ASC, m.created_at ASC;

-- 6. Testar envio de mensagem para a conversa de suporte
SELECT send_message_v2(
    '550e8400-e29b-41d4-a716-446655440000', -- UUID da conversa de suporte
    'test-firebase-uid',
    'Teste de mensagem para suporte',
    'text',
    NULL,
    NULL,
    NULL,
    NULL
) as message_id;

SELECT 'Conversa de suporte criada com UUID válido!' as status;


















