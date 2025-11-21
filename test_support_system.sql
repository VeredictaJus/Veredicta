-- Script para testar o sistema de suporte
-- Verifica se o usuário de suporte existe e se as conversas estão funcionando

-- 1. Verificar se o usuário de suporte existe
SELECT 
    'Verificação do usuário de suporte' AS teste,
    CASE 
        WHEN EXISTS(SELECT 1 FROM user_profiles WHERE firebase_uid = 'support-admin') 
        THEN '✅ Usuário de suporte existe'
        ELSE '❌ Usuário de suporte não encontrado'
    END AS status;

-- 2. Mostrar detalhes do usuário de suporte
SELECT 
    'Detalhes do usuário de suporte' AS teste,
    id,
    firebase_uid,
    email,
    role,
    full_name,
    created_at
FROM user_profiles 
WHERE firebase_uid = 'support-admin';

-- 3. Verificar conversas de suporte existentes
SELECT 
    'Conversas de suporte existentes' AS teste,
    c.id,
    c.title,
    c.type,
    c.status,
    c.created_at,
    COUNT(cp.user_id) AS total_participantes
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE c.type = 'support'
GROUP BY c.id, c.title, c.type, c.status, c.created_at
ORDER BY c.created_at DESC;

-- 4. Verificar participantes das conversas de suporte
SELECT 
    'Participantes das conversas de suporte' AS teste,
    c.title AS conversa,
    cp.user_id,
    cp.role,
    up.full_name,
    up.email
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN user_profiles up ON cp.user_id = up.firebase_uid
WHERE c.type = 'support'
ORDER BY c.created_at DESC, cp.role;

-- 5. Verificar se há mensagens nas conversas de suporte
SELECT 
    'Mensagens nas conversas de suporte' AS teste,
    c.title AS conversa,
    COUNT(m.id) AS total_mensagens,
    MAX(m.created_at) AS ultima_mensagem
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.type = 'support'
GROUP BY c.id, c.title
ORDER BY c.created_at DESC;

-- 6. Status geral do sistema
SELECT 
    'Status geral do sistema' AS teste,
    (SELECT COUNT(*) FROM conversations WHERE type = 'support') AS conversas_suporte,
    (SELECT COUNT(*) FROM conversation_participants WHERE role = 'support') AS participantes_suporte,
    (SELECT COUNT(*) FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE c.type = 'support') AS mensagens_suporte;
