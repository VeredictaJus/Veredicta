-- CORREÇÃO FINAL - Usando Supabase Auth corretamente
-- Execute este SQL no Supabase SQL Editor

-- 1. PRIMEIRO: Verificar estrutura da tabela messages
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 2. Adicionar colunas que podem estar faltando
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS file_name VARCHAR,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar sent_at para mensagens existentes
UPDATE messages 
SET sent_at = COALESCE(sent_at, created_at, NOW()) 
WHERE sent_at IS NULL;

-- 3. CRIAR funções usando UUID (agora que corrigimos o frontend)
CREATE OR REPLACE FUNCTION send_message_v2(
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
    -- Verificar se a conversa existe
    IF NOT EXISTS (SELECT 1 FROM conversations WHERE id = p_conversation_id) THEN
        RAISE EXCEPTION 'Conversa não encontrada: %', p_conversation_id;
    END IF;
    
    -- Inserir a mensagem
    INSERT INTO messages (
        conversation_id,
        sender_id,
        content,
        message_type,
        attachment_url,
        file_name,
        file_size,
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
        NOW()
    )
    RETURNING id INTO new_message_id;

    -- Atualizar updated_at da conversa
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = p_conversation_id;

    RETURN new_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_message_as_read_v2(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_conversation_messages_v2(p_conversation_id UUID)
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
        NULL::UUID as reply_to_message_id,
        EXISTS (
            SELECT 1 FROM message_read_status mrs
            WHERE mrs.message_id = m.id
            AND mrs.reader_id = auth.uid()
        ) AS is_read
    FROM messages m
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.sent_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TESTAR as funções corrigidas
SELECT send_message_v2(
    (SELECT id FROM conversations LIMIT 1),
    auth.uid(),
    'Teste da função v2 corrigida',
    'text',
    NULL,
    'arquivo_teste.pdf',
    1024,
    NULL
) as message_id;

SELECT 'Funções v2 corrigidas com Supabase Auth!' as status;


















