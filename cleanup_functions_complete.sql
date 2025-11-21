-- LIMPEZA COMPLETA E DEFINITIVA - Execute este SQL no Supabase SQL Editor

-- Primeiro, vamos ver TODAS as funções que existem
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('send_message', 'mark_message_as_read', 'get_conversation_messages')
AND n.nspname = 'public'
ORDER BY p.proname, p.oid;

-- Remover TODAS as funções usando OID (mais eficaz)
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Remover todas as funções send_message
    FOR func_record IN 
        SELECT p.oid, p.proname, pg_get_function_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'send_message' AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.args || ') CASCADE';
        RAISE NOTICE 'Removida função: % (%)', func_record.proname, func_record.args;
    END LOOP;
    
    -- Remover todas as funções mark_message_as_read
    FOR func_record IN 
        SELECT p.oid, p.proname, pg_get_function_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'mark_message_as_read' AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.args || ') CASCADE';
        RAISE NOTICE 'Removida função: % (%)', func_record.proname, func_record.args;
    END LOOP;
    
    -- Remover todas as funções get_conversation_messages
    FOR func_record IN 
        SELECT p.oid, p.proname, pg_get_function_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'get_conversation_messages' AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.args || ') CASCADE';
        RAISE NOTICE 'Removida função: % (%)', func_record.proname, func_record.args;
    END LOOP;
END $$;

-- Agora criar APENAS UMA versão de cada função
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

-- Verificar se agora temos apenas uma função de cada
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('send_message', 'mark_message_as_read', 'get_conversation_messages')
AND n.nspname = 'public'
ORDER BY p.proname;

SELECT 'Limpeza completa realizada!' as status;


















