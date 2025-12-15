-- 🔧 CORREÇÃO DO PLACEHOLDER USER_FIREBASE_UID - VERSÃO CORRIGIDA
-- Este script remove o placeholder que está causando problemas

-- 1. Verificar quantos registros têm o placeholder
SELECT
  '🔍 VERIFICAÇÃO DE PLACEHOLDERS' as info,
  COUNT(*) as total_placeholders
FROM conversation_participants
WHERE user_id = 'USER_FIREBASE_UID';

-- 2. Verificar se o usuário real já está na tabela
SELECT
  'VERIFICAÇÃO DO USUÁRIO REAL' as info,
  conversation_id,
  user_id,
  role,
  joined_at
FROM conversation_participants
WHERE user_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1'
  AND conversation_id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. 🚀 CORREÇÃO: REMOVER o placeholder (não atualizar)
DELETE FROM conversation_participants
WHERE user_id = 'USER_FIREBASE_UID'
AND conversation_id = '550e8400-e29b-41d4-a716-446655440000';

-- 4. Verificar se a correção funcionou
SELECT
  '✅ VERIFICAÇÃO PÓS-CORREÇÃO' as info,
  conversation_id,
  user_id,
  role,
  joined_at
FROM conversation_participants
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY joined_at;

-- 5. Verificar se não há duplicatas
SELECT
  'VERIFICAÇÃO DE DUPLICATAS' as info,
  user_id,
  COUNT(*) as count
FROM conversation_participants
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 6. ✅ VERIFICAÇÃO FINAL: Apenas o usuário real deve existir
SELECT
  '🎯 RESULTADO FINAL' as info,
  COUNT(*) as total_participants,
  CASE 
    WHEN COUNT(*) = 1 
    THEN '✅ SUCESSO: Apenas um usuário presente'
    ELSE '❌ ERRO: Ainda há problemas'
  END as status,
  STRING_AGG(user_id, ', ') as user_ids
FROM conversation_participants
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY conversation_id;
