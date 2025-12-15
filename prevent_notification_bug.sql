-- 🛡️ PREVENÇÃO DO BUG DE NOTIFICAÇÕES FANTASMAS
-- Este script cria triggers para manter unread_count sempre correto

-- 1. Função para calcular unread_count corretamente
CREATE OR REPLACE FUNCTION calculate_conversation_unread_count(conv_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM messages m
  WHERE m.conversation_id = conv_id
    AND m.created_at > COALESCE(
      (SELECT cp.last_read_at 
       FROM conversation_participants cp 
       WHERE cp.conversation_id = conv_id 
       LIMIT 1), 
      '1900-01-01'::timestamp
    );
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger para atualizar unread_count quando uma mensagem é inserida
CREATE OR REPLACE FUNCTION update_conversation_unread_count_on_message_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o unread_count da conversa
  UPDATE conversations 
  SET unread_count = calculate_conversation_unread_count(NEW.conversation_id)
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para atualizar unread_count quando last_read_at é atualizado
CREATE OR REPLACE FUNCTION update_conversation_unread_count_on_read_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o unread_count da conversa
  UPDATE conversations 
  SET unread_count = calculate_conversation_unread_count(NEW.conversation_id)
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar os triggers
DROP TRIGGER IF EXISTS trigger_update_unread_count_on_message_insert ON messages;
CREATE TRIGGER trigger_update_unread_count_on_message_insert
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_unread_count_on_message_insert();

DROP TRIGGER IF EXISTS trigger_update_unread_count_on_read_update ON conversation_participants;
CREATE TRIGGER trigger_update_unread_count_on_read_update
  AFTER UPDATE OF last_read_at ON conversation_participants
  FOR EACH ROW
  WHEN (OLD.last_read_at IS DISTINCT FROM NEW.last_read_at)
  EXECUTE FUNCTION update_conversation_unread_count_on_read_update();

-- 5. Atualizar todas as conversas com o unread_count correto
UPDATE conversations 
SET unread_count = calculate_conversation_unread_count(id);

-- 6. Verificar se os triggers foram criados
SELECT 
  '✅ TRIGGERS CRIADOS' as info,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%unread_count%';

-- 7. Teste final
SELECT 
  '✅ TESTE FINAL' as info,
  'Total de conversas' as metric,
  COUNT(*) as value
FROM conversations
UNION ALL
SELECT 
  '✅ TESTE FINAL',
  'Conversas com unread_count > 0',
  COUNT(*)
FROM conversations 
WHERE unread_count > 0;























