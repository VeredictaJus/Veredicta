-- 🔍 DEBUG: INVESTIGAR PROBLEMA DE PARTICIPAÇÃO
-- Verificar por que o usuário não está sendo reconhecido como participante

-- 1. Verificar TODAS as conversas e seus participantes
SELECT
  '🔍 TODAS AS CONVERSAS' as info,
  c.id as conversation_id,
  c.created_by,
  cp.user_id as participant_user_id,
  cp.role as participant_role,
  cp.joined_at
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE c.created_by = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1'
ORDER BY c.created_at DESC, cp.joined_at;

-- 2. Verificar especificamente a conversa que está dando erro
SELECT
  '🎯 CONVERSA ESPECÍFICA' as info,
  c.id as conversation_id,
  c.created_by,
  c.status,
  c.created_at,
  cp.user_id as participant_user_id,
  cp.role as participant_role,
  cp.joined_at
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE c.id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Verificar se o usuário existe em conversation_participants para esta conversa
SELECT
  '👤 VERIFICAÇÃO DE PARTICIPAÇÃO' as info,
  conversation_id,
  user_id,
  role,
  joined_at
FROM conversation_participants
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
  AND user_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';

-- 4. Verificar se há outras conversas onde o usuário está como participante
SELECT
  '📋 OUTRAS CONVERSAS DO USUÁRIO' as info,
  conversation_id,
  role,
  joined_at
FROM conversation_participants
WHERE user_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1'
ORDER BY joined_at DESC;























