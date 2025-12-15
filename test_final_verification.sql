-- 🎯 VERIFICAÇÃO FINAL SIMPLES
-- Teste final após correção do placeholder

-- Verificar status final da conversa
SELECT
  '🎯 RESULTADO FINAL' as info,
  conversation_id,
  COUNT(*) as total_participants,
  STRING_AGG(user_id, ', ') as user_ids,
  STRING_AGG(role, ', ') as roles
FROM conversation_participants
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY conversation_id;























