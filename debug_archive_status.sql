-- 🔍 DEBUG: Verificar status de arquivamento no banco
-- Execute este script no Supabase SQL Editor para verificar se o arquivamento está sendo persistido

-- 1. Verificar todas as conversas e seus status
SELECT 
    id,
    title,
    type,
    status,
    created_by,
    created_at,
    updated_at
FROM conversations 
ORDER BY updated_at DESC;

-- 2. Verificar especificamente a conversa que foi arquivada
SELECT 
    id,
    title,
    type,
    status,
    created_by,
    created_at,
    updated_at
FROM conversations 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Verificar se há conversas com status 'archived'
SELECT 
    COUNT(*) as total_archived,
    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM conversations;

-- 4. Verificar última atualização da conversa
SELECT 
    id,
    title,
    status,
    updated_at,
    EXTRACT(EPOCH FROM (NOW() - updated_at)) as seconds_since_update
FROM conversations 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';























