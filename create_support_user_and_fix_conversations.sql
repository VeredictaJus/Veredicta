-- Script para criar usuário de suporte e corrigir sistema de chat
-- Este script cria um usuário de suporte e garante que as conversas funcionem

-- 1. Criar usuário de suporte (se não existir)
-- Primeiro, vamos inserir um registro na tabela user_profiles para o suporte
INSERT INTO user_profiles (
    user_id,
    name,
    email,
    role,
    avatar_url,
    created_at,
    updated_at
) VALUES (
    'support-admin',
    'Equipe de Suporte',
    'contato@veredictajus.com',
    'admin',
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- 2. Verificar se existem conversas órfãs (sem participantes)
-- Remover conversas que não têm participantes
DELETE FROM conversations 
WHERE id NOT IN (
    SELECT DISTINCT conversation_id 
    FROM conversation_participants
);

-- 3. Garantir que todas as conversas tenham pelo menos um participante
-- Adicionar o criador como participante se não existir
INSERT INTO conversation_participants (conversation_id, user_id, role)
SELECT 
    c.id,
    c.created_by,
    'client'
FROM conversations c
WHERE c.id NOT IN (
    SELECT conversation_id 
    FROM conversation_participants cp 
    WHERE cp.user_id = c.created_by
);

-- 4. Para conversas de suporte, garantir que tenham o admin de suporte
INSERT INTO conversation_participants (conversation_id, user_id, role)
SELECT 
    c.id,
    'support-admin',
    'support'
FROM conversations c
WHERE c.type = 'support'
AND c.id NOT IN (
    SELECT conversation_id 
    FROM conversation_participants cp 
    WHERE cp.user_id = 'support-admin'
);

-- 5. Atualizar estatísticas das conversas
UPDATE conversations 
SET updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT conversation_id 
    FROM conversation_participants
);

-- 6. Verificação final
SELECT 
    'Usuário de suporte criado' AS status,
    COUNT(*) AS total_conversations,
    COUNT(CASE WHEN type = 'support' THEN 1 END) AS support_conversations
FROM conversations;

-- 7. Mostrar participantes das conversas
SELECT 
    c.title,
    c.type,
    cp.user_id,
    cp.role,
    up.name,
    up.email
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN user_profiles up ON cp.user_id = up.user_id
ORDER BY c.created_at DESC, c.title;
