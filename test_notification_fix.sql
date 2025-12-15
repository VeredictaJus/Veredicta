-- 🧪 TESTE COMPLETO DA CORREÇÃO DAS NOTIFICAÇÕES
-- Este script testa se o bug das notificações fantasmas foi resolvido

-- 1. Verificar se a coluna unread_count existe agora
SELECT 
  '🔍 VERIFICAÇÃO DA COLUNA' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'conversations' 
        AND column_name = 'unread_count'
        AND table_schema = 'public'
    ) THEN '✅ Coluna unread_count existe'
    ELSE '❌ Coluna unread_count NÃO existe'
  END as status;

-- 2. Verificar valores atuais de unread_count
SELECT 
  '🔍 VALORES ATUAIS' as info,
  id,
  title,
  unread_count,
  CASE 
    WHEN unread_count > 0 THEN '⚠️ TEM NOTIFICAÇÕES'
    ELSE '✅ SEM NOTIFICAÇÕES'
  END as status
FROM conversations 
ORDER BY unread_count DESC;

-- 3. Verificar mensagens não lidas no banco
SELECT 
  '🔍 MENSAGENS NO BANCO' as info,
  COUNT(*) as total_messages,
  COUNT(CASE WHEN status = 'read' THEN 1 END) as messages_read,
  COUNT(CASE WHEN status != 'read' THEN 1 END) as messages_unread
FROM messages;

-- 4. Verificar participantes e suas leituras
SELECT 
  '🔍 PARTICIPANTES' as info,
  cp.conversation_id,
  cp.user_id,
  cp.last_read_at,
  COUNT(m.id) as messages_after_last_read
FROM conversation_participants cp
LEFT JOIN messages m ON m.conversation_id = cp.conversation_id 
  AND m.created_at > COALESCE(cp.last_read_at, '1900-01-01'::timestamp)
GROUP BY cp.conversation_id, cp.user_id, cp.last_read_at
ORDER BY messages_after_last_read DESC;

-- 5. Testar função de cálculo
SELECT 
  '🧪 TESTE DA FUNÇÃO' as info,
  id as conversation_id,
  title,
  unread_count as stored_count,
  calculate_conversation_unread_count(id) as calculated_count,
  CASE 
    WHEN unread_count = calculate_conversation_unread_count(id) THEN '✅ CORRETO'
    ELSE '❌ INCORRETO'
  END as status
FROM conversations;

-- 6. Resumo final
SELECT 
  '📊 RESUMO FINAL' as info,
  'Total de conversas' as metric,
  COUNT(*) as value
FROM conversations
UNION ALL
SELECT 
  '📊 RESUMO FINAL',
  'Conversas com unread_count > 0',
  COUNT(*)
FROM conversations 
WHERE unread_count > 0
UNION ALL
SELECT 
  '📊 RESUMO FINAL',
  'Total de mensagens não lidas',
  COUNT(*)
FROM messages 
WHERE status != 'read'
UNION ALL
SELECT 
  '📊 RESUMO FINAL',
  'Triggers ativos',
  COUNT(*)
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%unread_count%';























