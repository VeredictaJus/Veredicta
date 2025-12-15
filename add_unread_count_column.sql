-- 🏗️ ADICIONAR COLUNA UNREAD_COUNT À TABELA CONVERSATIONS
-- Este script adiciona a coluna que está faltando para resolver o bug das notificações

-- 1. Adicionar coluna unread_count à tabela conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0;

-- 2. Criar função para calcular unread_count baseado em mensagens e participantes
CREATE OR REPLACE FUNCTION calculate_conversation_unread_count(conv_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  -- Contar mensagens criadas após a última leitura dos participantes
  SELECT COUNT(*)
  INTO unread_count
  FROM messages m
  WHERE m.conversation_id = conv_id
    AND m.created_at > COALESCE(
      (SELECT MAX(cp.last_read_at) 
       FROM conversation_participants cp 
       WHERE cp.conversation_id = conv_id), 
      '1900-01-01'::timestamp
    );
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 3. Atualizar todas as conversas com o unread_count correto
UPDATE conversations 
SET unread_count = calculate_conversation_unread_count(id);

-- 4. Criar trigger para atualizar unread_count quando mensagem é inserida
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

-- 5. Criar trigger para atualizar unread_count quando last_read_at é atualizado
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

-- 6. Criar os triggers
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

-- 7. Verificar se a coluna foi adicionada
SELECT 
  '✅ VERIFICAÇÃO DA NOVA COLUNA' as info,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversations' 
  AND column_name = 'unread_count'
  AND table_schema = 'public';

-- 8. Verificar valores atuais
SELECT 
  '✅ VERIFICAÇÃO DOS VALORES' as info,
  id,
  title,
  unread_count
FROM conversations 
ORDER BY unread_count DESC;

-- 9. Verificar triggers criados
SELECT 
  '✅ TRIGGERS CRIADOS' as info,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%unread_count%';























