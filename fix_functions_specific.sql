-- CORREÇÃO DEFINITIVA - Remover funções específicas por assinatura
-- Execute este SQL no Supabase SQL Editor

-- Primeiro, vamos ver quais funções existem
SELECT routine_name, data_type, parameter_name, parameter_mode
FROM information_schema.routines r
LEFT JOIN information_schema.parameters p ON r.specific_name = p.specific_name
WHERE routine_name IN ('send_message', 'mark_message_as_read', 'get_conversation_messages')
ORDER BY routine_name, ordinal_position;

-- Remover funções send_message específicas
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT, VARCHAR);
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT, VARCHAR, TEXT);
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT, VARCHAR, TEXT, TEXT);
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT, VARCHAR, TEXT, TEXT, BIGINT);
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT, VARCHAR, TEXT, TEXT, BIGINT, UUID);

-- Remover funções mark_message_as_read específicas
DROP FUNCTION IF EXISTS mark_message_as_read(UUID, UUID);

-- Remover funções get_conversation_messages específicas
DROP FUNCTION IF EXISTS get_conversation_messages(UUID);

-- Agora criar as funções únicas
CREATE OR REPLACE FUNCTION send_message(
    p_conversation_id UUID,
    p_sender_id UUID,
    p_content TEXT,
    p_message_type VARCHAR DEFAULT 'text',
    p_file_url TEXT DEFAULT NULL,
    p_file_name TEXT DEFAULT NULL,
    p_file_size BIGINT DEFAULT NULL,
    p_reply_to_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_message_id UUID;
BEGIN
    INSERT INTO messages (
        conversation_id,
        sender_id,
        content,
        message_type,
        attachment_url,
        file_name,
        file_size,
        reply_to_message_id,
        sent_at
    )
    VALUES (
        p_conversation_id,
        p_sender_id,
        p_content,
        p_message_type,
        p_file_url,
        p_file_name,
        p_file_size,
        p_reply_to_id,
        NOW()
    )
    RETURNING id INTO new_message_id;

    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = p_conversation_id;

    RETURN new_message_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_message_as_read(
    p_message_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO message_read_status (message_id, reader_id)
    VALUES (p_message_id, p_user_id)
    ON CONFLICT (message_id, reader_id) DO NOTHING;

    UPDATE conversation_participants
    SET last_read_message_id = p_message_id
    WHERE user_id = p_user_id
    AND conversation_id = (SELECT conversation_id FROM messages WHERE id = p_message_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

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

SELECT 'Funções criadas com sucesso!' as status;
