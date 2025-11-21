-- 🔧 CORREÇÃO DA LÓGICA DE ARQUIVAMENTO
-- Este script verifica e corrige a lógica de permissão para arquivamento

-- 1. Verificar se o usuário está na tabela conversation_participants
SELECT 
  '🔍 VERIFICAÇÃO DE PARTICIPAÇÃO' as info,
  cp.conversation_id,
  cp.user_id,
  cp.role,
  c.created_by,
  c.title
FROM conversation_participants cp
JOIN conversations c ON c.id = cp.conversation_id
WHERE cp.conversation_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY cp.joined_at;

-- 2. Verificar se há algum usuário com Firebase UID na tabela
SELECT 
  '🔍 VERIFICAÇÃO DE FIREBASE UID' as info,
  cp.user_id,
  cp.role,
  CASE 
    WHEN cp.user_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1' THEN '✅ É O USUÁRIO FIREBASE'
    ELSE '❌ NÃO É O USUÁRIO FIREBASE'
  END as is_firebase_user
FROM conversation_participants cp
WHERE cp.conversation_id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Verificar se o usuário Firebase é o criador da conversa
SELECT 
  '🔍 VERIFICAÇÃO DE CRIADOR' as info,
  id,
  title,
  created_by,
  CASE 
    WHEN created_by = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1' THEN '✅ USUÁRIO É O CRIADOR'
    ELSE '❌ USUÁRIO NÃO É O CRIADOR'
  END as is_creator
FROM conversations 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 4. Resumo do problema
SELECT 
  '📊 RESUMO DO PROBLEMA' as info,
  'Usuário Firebase UID' as metric,
  'yNTB2V3606WPxV0z1ZxLQNV1tCm1' as value
UNION ALL
SELECT 
  '📊 RESUMO DO PROBLEMA',
  'É criador da conversa',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = '550e8400-e29b-41d4-a716-446655440000' 
        AND created_by = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1'
    ) THEN 'SIM'
    ELSE 'NÃO'
  END
UNION ALL
SELECT 
  '📊 RESUMO DO PROBLEMA',
  'É participante na tabela',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000' 
        AND user_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1'
    ) THEN 'SIM'
    ELSE 'NÃO'
  END;























