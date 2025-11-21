-- Correção Específica para Função get_user_conversations
-- Resolve ambiguidade de colunas e garante compatibilidade com Firebase UID

-- 1. Remover função problemática
DROP FUNCTION IF EXISTS get_user_conversations(TEXT);

-- 2. Criar função corrigida com colunas específicas
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id TEXT)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    type VARCHAR,
    status VARCHAR,
    priority VARCHAR,
    created_by TEXT,
    assigned_to TEXT,
    petition_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_message_content TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.title,
        c.type,
        c.status,
        c.priority,
        c.created_by,
        c.assigned_to,
        c.petition_id,
        c.created_at,
        c.updated_at,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY messages.created_at DESC LIMIT 1) AS last_message_content,
        (SELECT messages.created_at FROM messages WHERE conversation_id = c.id ORDER BY messages.created_at DESC LIMIT 1) AS last_message_at,
        (
            SELECT COUNT(m.id)
            FROM messages m
            LEFT JOIN message_read_status mrs ON m.id = mrs.message_id AND mrs.user_id = p_user_id
            WHERE m.conversation_id = c.id
            AND mrs.read_at IS NULL
            AND m.sender_id != p_user_id
        ) AS unread_count
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    WHERE cp.user_id = p_user_id
    ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Verificar se todas as colunas estão como TEXT
-- Se ainda houver colunas UUID, vamos alterá-las
DO $$
BEGIN
    -- Verificar e alterar created_by se necessário
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'created_by' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE conversations ALTER COLUMN created_by TYPE TEXT;
    END IF;
    
    -- Verificar e alterar assigned_to se necessário
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'assigned_to' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE conversations ALTER COLUMN assigned_to TYPE TEXT;
    END IF;
    
    -- Verificar e alterar user_id em conversation_participants se necessário
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE conversation_participants ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    -- Verificar e alterar sender_id em messages se necessário
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'sender_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE messages ALTER COLUMN sender_id TYPE TEXT;
    END IF;
    
    -- Verificar e alterar user_id em message_read_status se necessário
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'message_read_status' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE message_read_status ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;

-- 4. Recriar índices se necessário
DROP INDEX IF EXISTS idx_conversations_created_by;
DROP INDEX IF EXISTS idx_conversation_participants_user_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_message_read_status_user_id;

CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_message_read_status_user_id ON message_read_status(user_id);

-- 5. Verificação final
SELECT 'Função get_user_conversations corrigida com sucesso!' AS status;
