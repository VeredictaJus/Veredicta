-- Script corrigido para criar usuário de suporte
-- Baseado na estrutura real da tabela user_profiles

-- 1. Criar usuário de suporte usando a estrutura correta
INSERT INTO user_profiles (
    id,
    firebase_uid,
    email,
    role,
    full_name,
    company_name,
    cnpj,
    phone,
    address,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(), -- Gerar UUID para id
    'support-admin',   -- Firebase UID
    'contato@veredictajus.com',
    'admin',
    'Equipe de Suporte',
    'Veredicta',
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (firebase_uid) DO NOTHING;

-- 2. Verificar se o usuário foi criado
SELECT 
    'Usuário de suporte criado' AS status,
    id,
    firebase_uid,
    email,
    role,
    full_name
FROM user_profiles 
WHERE firebase_uid = 'support-admin';

-- 3. Corrigir conversas existentes
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

-- 5. Verificação final
SELECT 
    'Sistema corrigido' AS status,
    COUNT(*) AS total_conversations,
    COUNT(CASE WHEN type = 'support' THEN 1 END) AS support_conversations
FROM conversations;

-- 6. Mostrar participantes das conversas
SELECT 
    c.title,
    c.type,
    cp.user_id,
    cp.role,
    up.full_name,
    up.email
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN user_profiles up ON cp.user_id = up.firebase_uid
ORDER BY c.created_at DESC, c.title;
