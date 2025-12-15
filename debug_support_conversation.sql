-- 🔍 DEBUG: Investigar conversa fantasma com suporte

-- 1. Verificar todas as conversas com suporte
SELECT 
  c.id,
  c.title,
  c.type,
  c.status,
  c.created_by,
  c.created_at,
  c.updated_at,
  c.unread_count
FROM conversations c
WHERE c.title LIKE '%suporte%' 
   OR c.title LIKE '%Suporte%'
   OR c.title LIKE '%SUPORTE%'
   OR c.type = 'support'
ORDER BY c.created_at DESC;

-- 2. Verificar participantes das conversas com suporte
SELECT 
  c.id as conversation_id,
  c.title,
  c.status,
  cp.user_id,
  cp.role,
  cp.created_at as participant_created_at
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE c.title LIKE '%suporte%' 
   OR c.title LIKE '%Suporte%'
   OR c.title LIKE '%SUPORTE%'
   OR c.type = 'support'
ORDER BY c.created_at DESC, cp.created_at DESC;

-- 3. Verificar mensagens nas conversas com suporte
SELECT 
  c.id as conversation_id,
  c.title,
  c.status,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.title LIKE '%suporte%' 
   OR c.title LIKE '%Suporte%'
   OR c.title LIKE '%SUPORTE%'
   OR c.type = 'support'
GROUP BY c.id, c.title, c.status
ORDER BY c.created_at DESC;

-- 4. Verificar se há conversas duplicadas ou órfãs
SELECT 
  c.title,
  c.status,
  COUNT(*) as count,
  ARRAY_AGG(c.id) as conversation_ids
FROM conversations c
WHERE c.title LIKE '%suporte%' 
   OR c.title LIKE '%Suporte%'
   OR c.title LIKE '%SUPORTE%'
   OR c.type = 'support'
GROUP BY c.title, c.status
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 5. Verificar conversas sem participantes
SELECT 
  c.id,
  c.title,
  c.status,
  c.created_at
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE (c.title LIKE '%suporte%' 
   OR c.title LIKE '%Suporte%'
   OR c.title LIKE '%SUPORTE%'
   OR c.type = 'support')
AND cp.conversation_id IS NULL;

-- 6. Verificar conversas sem mensagens
SELECT 
  c.id,
  c.title,
  c.status,
  c.created_at
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE (c.title LIKE '%suporte%' 
   OR c.title LIKE '%Suporte%'
   OR c.title LIKE '%SUPORTE%'
   OR c.type = 'support')
AND m.conversation_id IS NULL;























