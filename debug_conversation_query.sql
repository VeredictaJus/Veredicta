-- 🔍 DEBUG: Investigar por que a query não encontra conversas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a conversa existe
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

-- 2. Verificar todas as conversas do usuário
SELECT 
    id,
    title,
    type,
    status,
    created_by,
    created_at,
    updated_at
FROM conversations 
WHERE created_by = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1'
ORDER BY updated_at DESC;

-- 3. Verificar se há conversas com created_by diferente
SELECT 
    DISTINCT created_by,
    COUNT(*) as count
FROM conversations 
GROUP BY created_by;

-- 4. Verificar se a conversa foi realmente atualizada
SELECT 
    id,
    title,
    status,
    updated_at,
    EXTRACT(EPOCH FROM (NOW() - updated_at)) as seconds_since_update
FROM conversations 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 5. Verificar RLS policies na tabela conversations
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'conversations';























