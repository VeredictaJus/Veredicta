-- 🔍 DIAGNÓSTICO ESPECÍFICO - PARTICIPAÇÃO DO USUÁRIO
-- Este script verifica se o usuário logado é participante das conversas

-- 1. Verificar se o usuário está autenticado
SELECT 
    '1. Verificação de Autenticação' AS teste,
    auth.uid() as user_id,
    auth.uid()::text as user_id_text,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ Usuário autenticado'
        ELSE '❌ Usuário não autenticado'
    END AS status_auth;

-- 2. Verificar todas as conversas existentes
SELECT 
    '2. Conversas Existentes' AS teste,
    id,
    title,
    created_by,
    type,
    status
FROM conversations
ORDER BY created_at DESC;

-- 3. Verificar todos os participantes existentes
SELECT 
    '3. Participantes Existentes' AS teste,
    cp.conversation_id,
    c.title as conversation_title,
    cp.user_id,
    cp.role,
    cp.joined_at
FROM conversation_participants cp
JOIN conversations c ON c.id = cp.conversation_id
ORDER BY cp.conversation_id, cp.joined_at;

-- 4. Verificar se o usuário atual é participante de alguma conversa
SELECT 
    '4. Participações do Usuário Atual' AS teste,
    COUNT(*) as total_participacoes,
    STRING_AGG(c.title, ', ') as conversas_participa
FROM conversation_participants cp
JOIN conversations c ON c.id = cp.conversation_id
WHERE cp.user_id = auth.uid()::text;

-- 5. Verificar mensagens existentes e seus remetentes
SELECT 
    '5. Mensagens Existentes' AS teste,
    m.id,
    m.conversation_id,
    c.title as conversation_title,
    m.sender_id,
    m.content,
    m.created_at
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
ORDER BY m.created_at DESC
LIMIT 10;

-- 6. Verificar se há conversas sem participantes
SELECT 
    '6. Conversas Sem Participantes' AS teste,
    c.id,
    c.title,
    c.created_by,
    COUNT(cp.user_id) as total_participantes
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
GROUP BY c.id, c.title, c.created_by
HAVING COUNT(cp.user_id) = 0;

-- 7. Verificar se o criador da conversa está registrado como participante
SELECT 
    '7. Criadores Como Participantes' AS teste,
    c.id,
    c.title,
    c.created_by,
    CASE 
        WHEN EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = c.id AND cp.user_id = c.created_by) 
        THEN '✅ Criador é participante'
        ELSE '❌ Criador NÃO é participante'
    END AS status_criador_participante
FROM conversations c;

-- 8. Teste específico: tentar inserir participante para conversas que não têm
INSERT INTO conversation_participants (conversation_id, user_id, role)
SELECT 
    c.id as conversation_id,
    c.created_by as user_id,
    'creator' as role
FROM conversations c
WHERE NOT EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = c.id 
    AND cp.user_id = c.created_by
)
RETURNING conversation_id, user_id, role;

-- 9. Verificação final após correção
SELECT 
    '9. Verificação Final' AS teste,
    COUNT(*) as total_participantes,
    COUNT(DISTINCT conversation_id) as conversas_com_participantes
FROM conversation_participants;























