-- 🔧 CORREÇÃO DO BUG DE NOTIFICAÇÕES FANTASMAS
-- Este script corrige o contador de notificações mostrando valores incorretos

-- 1. Zerar todos os unread_count das conversas (correção temporária)
UPDATE conversations 
SET unread_count = 0 
WHERE unread_count > 0;

-- 2. Atualizar last_read_at dos participantes para agora (marca todas como lidas)
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
WHERE last_read_at IS NULL OR last_read_at < NOW() - INTERVAL '1 day';

-- 3. Marcar todas as mensagens como lidas
UPDATE messages 
SET status = 'read' 
WHERE status != 'read';

-- 4. Verificar se a correção funcionou
SELECT 
  '✅ VERIFICAÇÃO PÓS-CORREÇÃO' as info,
  'Conversas com unread_count > 0' as metric,
  COUNT(*) as value
FROM conversations 
WHERE unread_count > 0
UNION ALL
SELECT 
  '✅ VERIFICAÇÃO PÓS-CORREÇÃO',
  'Mensagens não lidas',
  COUNT(*)
FROM messages 
WHERE status != 'read'
UNION ALL
SELECT 
  '✅ VERIFICAÇÃO PÓS-CORREÇÃO',
  'Total de conversas',
  COUNT(*)
FROM conversations;























