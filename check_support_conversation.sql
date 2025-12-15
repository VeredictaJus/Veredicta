-- VERIFICAR SE A CONVERSA "support" EXISTE E CRIAR SE NECESSÁRIO
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a conversa "support" existe
SELECT 
    id, 
    title, 
    type, 
    status, 
    created_by,
    created_at
FROM conversations 
WHERE id = 'support' OR title ILIKE '%suporte%'
ORDER BY created_at DESC;

-- 2. Se não existir, criar a conversa de suporte
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
    'support',
    'Suporte Veredicta',
    'support',
    'active',
    'normal',
    'system', -- ID do sistema
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se o usuário atual é participante da conversa de suporte
SELECT 
    cp.conversation_id,
    cp.user_id,
    cp.role,
    cp.joined_at
FROM conversation_participants cp
WHERE cp.conversation_id = 'support';

-- 4. Adicionar o usuário atual como participante se não estiver
-- (Substitua 'USER_FIREBASE_UID' pelo UID real do usuário)
INSERT INTO conversation_participants (
    conversation_id,
    user_id,
    role,
    joined_at,
    last_read_at
) VALUES (
    'support',
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
WHERE m.conversation_id = 'support'
ORDER BY m.sent_at ASC, m.created_at ASC;

-- 6. Testar envio de mensagem para a conversa de suporte
SELECT send_message_v2(
    'support',
    'test-firebase-uid',
    'Teste de mensagem para suporte',
    'text',
    NULL,
    NULL,
    NULL,
    NULL
) as message_id;

SELECT 'Verificação concluída!' as status;


















