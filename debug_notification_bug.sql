-- 🔍 DIAGNÓSTICO DO BUG DE NOTIFICAÇÕES FANTASMAS
-- Este script verifica se há dados inconsistentes que causam o contador de 7 notificações

-- 1. Verificar conversas e seus unread_count
SELECT 
  '🔍 VERIFICAÇÃO DE CONVERSAS' as info,
  id,
  title,
  unread_count,
  created_by,
  created_at
FROM conversations 
WHERE unread_count > 0
ORDER BY created_at DESC;

-- 2. Verificar se há mensagens não lidas
SELECT 
  '🔍 VERIFICAÇÃO DE MENSAGENS' as info,
  COUNT(*) as total_messages,
  COUNT(CASE WHEN status = 'read' THEN 1 END) as messages_read,
  COUNT(CASE WHEN status != 'read' THEN 1 END) as messages_unread
FROM messages;

-- 3. Verificar participantes e suas últimas leituras
SELECT 
  '🔍 VERIFICAÇÃO DE PARTICIPANTES' as info,
  cp.conversation_id,
  cp.user_id,
  cp.last_read_at,
  cp.last_read_message_id,
  COUNT(m.id) as total_messages_after_last_read
FROM conversation_participants cp
LEFT JOIN messages m ON m.conversation_id = cp.conversation_id 
  AND m.created_at > cp.last_read_at
GROUP BY cp.conversation_id, cp.user_id, cp.last_read_at, cp.last_read_message_id
HAVING COUNT(m.id) > 0;

-- 4. Verificar se há conversas com unread_count incorreto
SELECT 
  '🔍 CONVERSAS COM UNREAD_COUNT SUSPEITO' as info,
  c.id,
  c.title,
  c.unread_count as stored_unread_count,
  COUNT(m.id) as actual_unread_messages
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id 
  AND m.created_at > COALESCE(
    (SELECT cp.last_read_at 
     FROM conversation_participants cp 
     WHERE cp.conversation_id = c.id 
     LIMIT 1), 
    '1900-01-01'::timestamp
  )
GROUP BY c.id, c.title, c.unread_count
HAVING c.unread_count != COUNT(m.id);

-- 5. Mostrar resumo do problema
SELECT 
  '📊 RESUMO DO PROBLEMA' as info,
  'Total de conversas' as metric,
  COUNT(*) as value
FROM conversations
UNION ALL
SELECT 
  '📊 RESUMO DO PROBLEMA',
  'Conversas com unread_count > 0',
  COUNT(*)
FROM conversations 
WHERE unread_count > 0
UNION ALL
SELECT 
  '📊 RESUMO DO PROBLEMA',
  'Total de mensagens',
  COUNT(*)
FROM messages
UNION ALL
SELECT 
  '📊 RESUMO DO PROBLEMA',
  'Mensagens não lidas (status != read)',
  COUNT(*)
FROM messages 
WHERE status != 'read';























