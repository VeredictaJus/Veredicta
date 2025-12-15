-- 🔧 CORREÇÃO FINAL: SINCRONIZAR DADOS E CORRIGIR PROBLEMAS
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todas as conversas existentes
SELECT 
    'Conversas existentes' as info,
    id,
    title,
    type,
    status,
    created_by,
    created_at
FROM conversations
ORDER BY created_at DESC;

-- 2. Verificar se há conversas com UIDs do Firebase
SELECT 
    'Conversas com Firebase UID' as info,
    id,
    title,
    created_by,
    CASE 
        WHEN created_by LIKE 'yNTB2V3606WPxV0z1ZxLQNV1tCm1' 
        THEN '✅ MATCH Firebase UID'
        ELSE '❌ Não é Firebase UID'
    END as match_firebase
FROM conversations
WHERE created_by NOT LIKE '550e8400%' -- Excluir UUIDs de teste
ORDER BY created_at DESC;

-- 3. Atualizar a conversa existente para usar o Firebase UID correto
-- ATENÇÃO: Substitua 'yNTB2V3606WPxV0z1ZxLQNV1tCm1' pelo UID correto do usuário
UPDATE conversations 
SET created_by = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1'
WHERE id = '550e8400-e29b-41d4-a716-446655440000'
RETURNING id, title, created_by;

-- 4. Verificar se a atualização funcionou
SELECT 
    'Verificação pós-atualização' as info,
    id,
    title,
    created_by,
    CASE 
        WHEN created_by = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1' 
        THEN '✅ MATCH'
        ELSE '❌ NO MATCH'
    END as match_status
FROM conversations
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 5. Criar uma nova conversa de teste com o Firebase UID correto
INSERT INTO conversations (
    id, 
    title, 
    type, 
    status, 
    created_by,
    created_at,
    updated_at
) VALUES (
    'test-firebase-conversation-' || extract(epoch from now())::text,
    'Conversa de Teste Firebase',
    'support',
    'active',
    'yNTB2V3606WPxV0z1ZxLQNV1tCm1',
    NOW(),
    NOW()
)
RETURNING id, title, created_by;

-- 6. Verificar se as políticas RLS estão funcionando
SELECT 
    'Teste RLS pós-correção' as info,
    COUNT(*) as conversas_visiveis
FROM conversations
WHERE created_by = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';

-- 7. Limpar conversas antigas de teste (opcional)
-- Descomente as linhas abaixo se quiser limpar dados de teste antigos
/*
DELETE FROM conversations 
WHERE created_by = '550e8400-e29b-41d4-a716-446655440001'
RETURNING id, title;
*/
























