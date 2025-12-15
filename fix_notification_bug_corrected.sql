-- 🔧 CORREÇÃO DO BUG DE NOTIFICAÇÕES - VERSÃO CORRIGIDA
-- Este script corrige o problema SEM depender da coluna unread_count que não existe

-- 1. Verificar estrutura atual da tabela conversations
SELECT 
  '🔍 ESTRUTURA DA TABELA CONVERSATIONS' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar mensagens não lidas (baseado em status)
SELECT 
  '🔍 MENSAGENS NÃO LIDAS' as info,
  conversation_id,
  COUNT(*) as unread_messages,
  MAX(created_at) as last_unread_message
FROM messages 
WHERE status != 'read'
GROUP BY conversation_id
ORDER BY unread_messages DESC;

-- 3. Verificar participantes com mensagens não lidas
SELECT 
  '🔍 PARTICIPANTES COM MENSAGENS NÃO LIDAS' as info,
  cp.conversation_id,
  cp.user_id,
  cp.last_read_at,
  COUNT(m.id) as messages_after_last_read
FROM conversation_participants cp
LEFT JOIN messages m ON m.conversation_id = cp.conversation_id 
  AND m.created_at > COALESCE(cp.last_read_at, '1900-01-01'::timestamp)
GROUP BY cp.conversation_id, cp.user_id, cp.last_read_at
HAVING COUNT(m.id) > 0
ORDER BY messages_after_last_read DESC;

-- 4. Marcar todas as mensagens como lidas (correção temporária)
UPDATE messages 
SET status = 'read' 
WHERE status != 'read';

-- 5. Atualizar last_read_at dos participantes para agora
UPDATE conversation_participants 
SET 
  last_read_at = NOW(),
  last_read_message_id = (
    SELECT id 
    FROM messages 
    WHERE conversation_id = conversation_participants.conversation_id 
    ORDER BY created_at DESC 
    LIMIT 1
  )
WHERE last_read_at IS NULL 
   OR last_read_at < NOW() - INTERVAL '1 day';

-- 6. Verificar se a correção funcionou
SELECT 
  '✅ VERIFICAÇÃO PÓS-CORREÇÃO' as info,
  'Mensagens não lidas' as metric,
  COUNT(*) as value
FROM messages 
WHERE status != 'read'
UNION ALL
SELECT 
  '✅ VERIFICAÇÃO PÓS-CORREÇÃO',
  'Total de mensagens',
  COUNT(*)
FROM messages
UNION ALL
SELECT 
  '✅ VERIFICAÇÃO PÓS-CORREÇÃO',
  'Participantes com mensagens não lidas',
  COUNT(DISTINCT cp.user_id)
FROM conversation_participants cp
LEFT JOIN messages m ON m.conversation_id = cp.conversation_id 
  AND m.created_at > COALESCE(cp.last_read_at, '1900-01-01'::timestamp)
WHERE m.id IS NOT NULL;























