-- Script corrigido para criar usuário de suporte
-- Este script cria um usuário de suporte usando a estrutura correta da tabela user_profiles

-- 1. Verificar estrutura da tabela user_profiles primeiro
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. Criar usuário de suporte usando a estrutura correta
-- Tentativa 1: Se a tabela usar 'id' como chave primária
INSERT INTO user_profiles (
    id,
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
) ON CONFLICT (id) DO NOTHING;

-- 3. Se a primeira tentativa falhar, tentar com 'user_id'
-- (Comentado para evitar erro, descomente se necessário)
/*
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
*/

-- 4. Verificar se o usuário foi criado
SELECT 
    'Usuário de suporte criado' AS status,
    id,
    name,
    email,
    role
FROM user_profiles 
WHERE id = 'support-admin' OR email = 'contato@veredictajus.com';

-- 5. Corrigir conversas existentes (usando o ID correto)
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

-- 6. Para conversas de suporte, garantir que tenham o admin de suporte
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

-- 7. Verificação final
SELECT 
    'Sistema corrigido' AS status,
    COUNT(*) AS total_conversations,
    COUNT(CASE WHEN type = 'support' THEN 1 END) AS support_conversations
FROM conversations;

-- 8. Mostrar participantes das conversas
SELECT 
    c.title,
    c.type,
    cp.user_id,
    cp.role,
    up.name,
    up.email
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN user_profiles up ON cp.user_id = up.id
ORDER BY c.created_at DESC, c.title;
