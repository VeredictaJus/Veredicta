-- =========================================
-- SCRIPT PARA HABILITAR FUNCIONALIDADES AVANÇADAS DO CHAT ADMIN
-- =========================================
-- Execute este script no Supabase SQL Editor quando quiser
-- habilitar o sistema completo de múltiplos admins
-- 
-- ⚠️ OPCIONAL: Sistema funciona sem isso para 1 admin!
-- =========================================

-- 1. Adicionar colunas necessárias
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS assigned_admin_id TEXT,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;

-- 2. Adicionar foreign key para admin
ALTER TABLE conversations
ADD CONSTRAINT fk_assigned_admin 
FOREIGN KEY (assigned_admin_id) 
REFERENCES profiles_v2(firebase_uid)
ON DELETE SET NULL;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_last_message 
ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_assigned_admin 
ON conversations(assigned_admin_id);

CREATE INDEX IF NOT EXISTS idx_conversations_status 
ON conversations(status);

-- 4. Atualizar last_message_at para conversas existentes
UPDATE conversations c
SET last_message_at = (
  SELECT MAX(created_at)
  FROM messages m
  WHERE m.conversation_id = c.id
)
WHERE last_message_at IS NULL;

-- 5. Criar trigger para atualizar last_message_at automaticamente
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;

-- Criar novo trigger
CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- 6. Comentários nas colunas (documentação)
COMMENT ON COLUMN conversations.metadata IS 'Dados extras da conversa (petition_id, etc)';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp da última mensagem (atualizado via trigger)';
COMMENT ON COLUMN conversations.assigned_admin_id IS 'UID do admin que está atendendo esta conversa';
COMMENT ON COLUMN conversations.assigned_at IS 'Quando a conversa foi atribuída ao admin';

-- =========================================
-- VERIFICAÇÃO
-- =========================================
-- Execute este SELECT para verificar se as colunas foram criadas:

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('metadata', 'last_message_at', 'assigned_admin_id', 'assigned_at')
ORDER BY ordinal_position;

-- =========================================
-- RESULTADO ESPERADO:
-- =========================================
-- metadata           | jsonb     | YES
-- last_message_at    | timestamp | YES
-- assigned_admin_id  | text      | YES
-- assigned_at        | timestamp | YES
-- =========================================














