-- 🔍 SCRIPT DE DEBUG PARA INVESTIGAR DADOS DA CONVERSATION
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todas as conversas e seus dados
SELECT 
    id,
    title,
    type,
    status,
    created_by,
    created_at,
    updated_at,
    -- Verificar se created_by é um UUID válido
    CASE 
        WHEN created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN 'UUID válido'
        ELSE 'NÃO é UUID válido'
    END as created_by_tipo,
    -- Verificar se created_by contém o UID do usuário logado
    CASE 
        WHEN created_by = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1' 
        THEN 'MATCH com usuário logado'
        ELSE 'NÃO match com usuário logado'
    END as match_usuario
FROM conversations
ORDER BY created_at DESC;

-- 2. Verificar especificamente a conversa problemática
SELECT 
    id,
    title,
    created_by,
    CASE 
        WHEN created_by = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1' 
        THEN 'MATCH'
        ELSE 'NO MATCH'
    END as match_status
FROM conversations 
WHERE id = 'd5d1f3b4-013c-4a9d-bc54-bbd601bc44ae';

-- 3. Verificar se a conversa existe
SELECT 
    EXISTS(
        SELECT 1 FROM conversations 
        WHERE id = 'd5d1f3b4-013c-4a9d-bc54-bbd601bc44ae'
    ) as conversa_existe;

-- 4. Verificar participantes da conversa
SELECT 
    cp.*,
    CASE 
        WHEN cp.user_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1' 
        THEN 'MATCH'
        ELSE 'NO MATCH'
    END as match_participante
FROM conversation_participants cp
WHERE cp.conversation_id = 'd5d1f3b4-013c-4a9d-bc54-bbd601bc44ae';

-- 5. Testar a política RLS manualmente
-- (Execute como o usuário logado)
SELECT 
    'Teste política SELECT' as teste,
    COUNT(*) as total_conversas_visiveis
FROM conversations
WHERE created_by = auth.uid()::text;

-- 6. Verificar se o auth.uid() está funcionando
SELECT 
    'Auth UID' as info,
    auth.uid() as current_user_id,
    auth.uid()::text as current_user_id_text;

-- 7. Verificar mensagens da conversa
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    created_at
FROM messages 
WHERE conversation_id = 'd5d1f3b4-013c-4a9d-bc54-bbd601bc44ae'
ORDER BY created_at DESC
LIMIT 5;
























