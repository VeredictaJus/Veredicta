-- 🧪 SCRIPT DE TESTE PARA EXCLUSÃO DE CONVERSAS
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o usuário atual logado
SELECT 
    'Usuário atual' as info,
    auth.uid() as user_id,
    auth.uid()::text as user_id_text,
    auth.role() as user_role;

-- 2. Verificar todas as conversas e quem as criou
SELECT 
    id,
    title,
    created_by,
    status,
    created_at,
    -- Verificar se o created_by é igual ao usuário logado
    CASE 
        WHEN created_by = auth.uid()::text THEN '✅ MATCH'
        ELSE '❌ NO MATCH'
    END as match_status,
    -- Verificar se created_by é um UUID válido
    CASE 
        WHEN created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN 'UUID válido'
        ELSE 'NÃO é UUID'
    END as created_by_tipo
FROM conversations
ORDER BY created_at DESC;

-- 3. Verificar especificamente a conversa problemática
SELECT 
    'Conversa específica' as info,
    id,
    title,
    created_by,
    status,
    created_at,
    CASE 
        WHEN created_by = auth.uid()::text THEN '✅ MATCH'
        ELSE '❌ NO MATCH'
    END as match_status
FROM conversations 
WHERE id = 'd5d1f3b4-013c-4a9d-bc54-bbd601bc44ae';

-- 4. Testar a política RLS de SELECT
SELECT 
    'Teste política SELECT' as teste,
    COUNT(*) as conversas_visiveis
FROM conversations
WHERE created_by = auth.uid()::text;

-- 5. Testar a política RLS de DELETE (simulação)
SELECT 
    'Teste política DELETE' as teste,
    COUNT(*) as conversas_deletaveis
FROM conversations
WHERE created_by = auth.uid()::text 
AND id = 'd5d1f3b4-013c-4a9d-bc54-bbd601bc44ae';

-- 6. Verificar participantes da conversa
SELECT 
    'Participantes' as info,
    cp.conversation_id,
    cp.user_id,
    cp.role,
    CASE 
        WHEN cp.user_id = auth.uid()::text THEN '✅ MATCH'
        ELSE '❌ NO MATCH'
    END as match_participante
FROM conversation_participants cp
WHERE cp.conversation_id = 'd5d1f3b4-013c-4a9d-bc54-bbd601bc44ae';

-- 7. Verificar mensagens da conversa
SELECT 
    'Mensagens' as info,
    COUNT(*) as total_mensagens
FROM messages 
WHERE conversation_id = 'd5d1f3b4-013c-4a9d-bc54-bbd601bc44ae';

-- 8. Testar inserção de uma conversa de teste (opcional)
-- Descomente as linhas abaixo para criar uma conversa de teste
/*
INSERT INTO conversations (id, title, type, status, created_by)
VALUES (
    'test-conversation-' || extract(epoch from now())::text,
    'Conversa de Teste',
    'general',
    'active',
    auth.uid()::text
)
RETURNING id, title, created_by;
*/
























