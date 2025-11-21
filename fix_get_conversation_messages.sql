-- CORRIGIR FUNÇÃO get_conversation_messages_v2 PARA USAR reader_id CORRETO
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar estrutura da tabela message_read_status
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'message_read_status'
ORDER BY ordinal_position;

-- 2. Corrigir função get_conversation_messages_v2
CREATE OR REPLACE FUNCTION get_conversation_messages_v2(p_conversation_id TEXT)
RETURNS TABLE (
    id TEXT,
    conversation_id TEXT,
    sender_id TEXT,
    content TEXT,
    attachment_url TEXT,
    file_name VARCHAR,
    file_size BIGINT,
    sent_at TIMESTAMP WITH TIME ZONE,
    message_type VARCHAR,
    reply_to_message_id TEXT,
    is_read BOOLEAN
) AS $$
DECLARE
    conv_uuid UUID;
BEGIN
    -- Converter conversation_id para UUID se possível
    BEGIN
        conv_uuid := p_conversation_id::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'ID de conversa inválido: %', p_conversation_id;
    END;
    
    RETURN QUERY
    SELECT
        m.id::TEXT,
        m.conversation_id::TEXT,
        m.sender_id::TEXT,
        m.content,
        m.attachment_url,
        m.file_name,
        m.file_size,
        m.sent_at,
        m.message_type,
        NULL::TEXT as reply_to_message_id,
        EXISTS (
            SELECT 1 FROM message_read_status mrs
            WHERE mrs.message_id = m.id
            AND (
                (mrs.reader_id IS NOT NULL AND mrs.reader_id = auth.uid()::TEXT) OR
                (mrs.user_id IS NOT NULL AND mrs.user_id = auth.uid()::TEXT)
            )
        ) AS is_read
    FROM messages m
    WHERE m.conversation_id = conv_uuid
    ORDER BY m.sent_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Testar a função corrigida
SELECT * FROM get_conversation_messages_v2('550e8400-e29b-41d4-a716-446655440000');

-- 4. Verificar se há mensagens na conversa de suporte
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    created_at,
    sent_at
FROM messages 
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY sent_at ASC;

SELECT 'Função get_conversation_messages_v2 corrigida!' as status;


















