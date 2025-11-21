-- Script SQL Essencial para Chat - Veredicta
-- Este script cria apenas as funções básicas necessárias para o chat funcionar

-- Remover funções existentes se houverem
DROP FUNCTION IF EXISTS get_user_conversations(UUID);
DROP FUNCTION IF EXISTS create_conversation(TEXT, VARCHAR, UUID, UUID[], VARCHAR[]);
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT, VARCHAR, TEXT, TEXT, BIGINT, UUID);
DROP FUNCTION IF EXISTS mark_message_as_read(UUID, UUID);
DROP FUNCTION IF EXISTS get_conversation_messages(UUID);

-- Função para obter conversas de um usuário
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    type VARCHAR,
    status VARCHAR,
    priority VARCHAR,
    created_by UUID,
    assigned_to UUID,
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
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) AS last_message_content,
        (SELECT sent_at FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) AS last_message_at,
        (
            SELECT COUNT(m.id)
            FROM messages m
            LEFT JOIN message_read_status mrs ON m.id = mrs.message_id AND mrs.reader_id = p_user_id
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

-- Função para criar uma nova conversa
CREATE OR REPLACE FUNCTION create_conversation(
    p_title TEXT,
    p_type VARCHAR(20),
    p_created_by UUID,
    p_participants UUID[],
    p_participant_roles VARCHAR[]
)
RETURNS UUID AS $$
DECLARE
    new_conversation_id UUID;
    participant_id UUID;
    participant_role VARCHAR;
    i INTEGER;
BEGIN
    -- Criar a conversa
    INSERT INTO conversations (title, type, created_by)
    VALUES (p_title, p_type, p_created_by)
    RETURNING id INTO new_conversation_id;

    -- Adicionar participantes
    FOR i IN 1..array_length(p_participants, 1) LOOP
        participant_id := p_participants[i];
        participant_role := p_participant_roles[i];
        
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (new_conversation_id, participant_id);
    END LOOP;

    RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Função para enviar uma mensagem
CREATE OR REPLACE FUNCTION send_message(
    p_conversation_id UUID,
    p_sender_id UUID,
    p_content TEXT,
    p_message_type VARCHAR(20) DEFAULT 'text',
    p_file_url TEXT DEFAULT NULL,
    p_file_name TEXT DEFAULT NULL,
    p_file_size BIGINT DEFAULT NULL,
    p_reply_to_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_message_id UUID;
BEGIN
    -- Inserir a mensagem
    INSERT INTO messages (
        conversation_id, 
        sender_id, 
        content, 
        message_type,
        attachment_url,
        file_name,
        file_size,
        reply_to_message_id
    )
    VALUES (
        p_conversation_id, 
        p_sender_id, 
        p_content, 
        p_message_type,
        p_file_url,
        p_file_name,
        p_file_size,
        p_reply_to_id
    )
    RETURNING id INTO new_message_id;

    -- Atualizar updated_at da conversa
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = p_conversation_id;

    RETURN new_message_id;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar uma mensagem como lida
CREATE OR REPLACE FUNCTION mark_message_as_read(
    p_message_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Inserir registro de leitura
    INSERT INTO message_read_status (message_id, reader_id)
    VALUES (p_message_id, p_user_id)
    ON CONFLICT (message_id, reader_id) DO NOTHING;

    -- Atualizar last_read_message_id para o participante
    UPDATE conversation_participants
    SET last_read_message_id = p_message_id
    WHERE user_id = p_user_id
    AND conversation_id = (SELECT conversation_id FROM messages WHERE id = p_message_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para obter mensagens de uma conversa
CREATE OR REPLACE FUNCTION get_conversation_messages(p_conversation_id UUID)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    sender_id UUID,
    content TEXT,
    attachment_url TEXT,
    file_name VARCHAR,
    file_size BIGINT,
    sent_at TIMESTAMP WITH TIME ZONE,
    message_type VARCHAR,
    reply_to_message_id UUID,
    is_read BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.attachment_url,
        m.file_name,
        m.file_size,
        m.sent_at,
        m.message_type,
        m.reply_to_message_id,
        EXISTS (
            SELECT 1 FROM message_read_status mrs 
            WHERE mrs.message_id = m.id 
            AND mrs.reader_id = auth.uid()
        ) AS is_read
    FROM messages m
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.sent_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON FUNCTION get_user_conversations(UUID) IS 'Retorna todas as conversas de um usuário específico';
COMMENT ON FUNCTION create_conversation(TEXT, VARCHAR, UUID, UUID[], VARCHAR[]) IS 'Cria uma nova conversa com participantes';
COMMENT ON FUNCTION send_message(UUID, UUID, TEXT, VARCHAR, TEXT, TEXT, BIGINT, UUID) IS 'Envia uma mensagem em uma conversa';
COMMENT ON FUNCTION mark_message_as_read(UUID, UUID) IS 'Marca uma mensagem como lida por um usuário';
COMMENT ON FUNCTION get_conversation_messages(UUID) IS 'Retorna todas as mensagens de uma conversa';
