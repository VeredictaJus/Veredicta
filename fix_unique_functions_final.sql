-- SOLUÇÃO DEFINITIVA - Remover TODAS as funções e criar apenas uma
-- Execute este SQL no Supabase SQL Editor

-- 1. REMOVER TODAS as funções send_message_v2 (todas as versões)
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Remover todas as funções send_message_v2
    FOR func_record IN 
        SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as identity_args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'send_message_v2' AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.identity_args || ') CASCADE';
        RAISE NOTICE 'Removida função send_message_v2: %', func_record.identity_args;
    END LOOP;
    
    -- Remover todas as funções mark_message_as_read_v2
    FOR func_record IN 
        SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as identity_args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'mark_message_as_read_v2' AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.identity_args || ') CASCADE';
        RAISE NOTICE 'Removida função mark_message_as_read_v2: %', func_record.identity_args;
    END LOOP;
    
    -- Remover todas as funções get_conversation_messages_v2
    FOR func_record IN 
        SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as identity_args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'get_conversation_messages_v2' AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.identity_args || ') CASCADE';
        RAISE NOTICE 'Removida função get_conversation_messages_v2: %', func_record.identity_args;
    END LOOP;
END $$;

-- 2. Verificar estrutura da tabela messages
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 3. Adicionar colunas que podem estar faltando
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS file_name VARCHAR,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar sent_at para mensagens existentes
UPDATE messages 
SET sent_at = COALESCE(sent_at, created_at, NOW()) 
WHERE sent_at IS NULL;

-- 4. CRIAR APENAS UMA versão de cada função (TEXT para Firebase UIDs)
CREATE OR REPLACE FUNCTION send_message_v2(
    p_conversation_id TEXT,
    p_sender_id TEXT,
    p_content TEXT,
    p_message_type VARCHAR DEFAULT 'text',
    p_file_url TEXT DEFAULT NULL,
    p_file_name TEXT DEFAULT NULL,
    p_file_size BIGINT DEFAULT NULL,
    p_reply_to_id TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    new_message_id TEXT;
    conv_uuid UUID;
    sender_text TEXT;
BEGIN
    -- Converter conversation_id para UUID se possível
    BEGIN
        conv_uuid := p_conversation_id::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'ID de conversa inválido: %', p_conversation_id;
    END;
    
    -- Usar sender_id como TEXT (Firebase UID)
    sender_text := p_sender_id;
    
    -- Verificar se a conversa existe
    IF NOT EXISTS (SELECT 1 FROM conversations WHERE id = conv_uuid) THEN
        RAISE EXCEPTION 'Conversa não encontrada: %', p_conversation_id;
    END IF;
    
    -- Inserir a mensagem (usando sender_id como TEXT)
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
        conv_uuid,
        sender_text,
        p_content,
        p_message_type,
        p_file_url,
        p_file_name,
        p_file_size,
        NOW()
    )
    RETURNING id::TEXT INTO new_message_id;

    -- Atualizar updated_at da conversa
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = conv_uuid;

    RETURN new_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_message_as_read_v2(
    p_message_id TEXT,
    p_user_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    msg_uuid UUID;
    user_text TEXT;
BEGIN
    -- Converter message_id para UUID se possível
    BEGIN
        msg_uuid := p_message_id::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'ID de mensagem inválido: %', p_message_id;
    END;
    
    -- Usar user_id como TEXT (Firebase UID)
    user_text := p_user_id;
    
    -- Inserir registro de leitura
    INSERT INTO message_read_status (message_id, reader_id)
    VALUES (msg_uuid, user_text)
    ON CONFLICT (message_id, reader_id) DO NOTHING;

    -- Atualizar last_read_message_id para o participante
    UPDATE conversation_participants
    SET last_read_message_id = msg_uuid
    WHERE user_id = user_text
    AND conversation_id = (SELECT conversation_id FROM messages WHERE id = msg_uuid);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
            AND mrs.reader_id = auth.uid()
        ) AS is_read
    FROM messages m
    WHERE m.conversation_id = conv_uuid
    ORDER BY m.sent_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VERIFICAR se agora temos apenas uma função de cada
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as identity_args
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('send_message_v2', 'mark_message_as_read_v2', 'get_conversation_messages_v2')
AND n.nspname = 'public'
ORDER BY p.proname;

-- 6. TESTAR as funções
SELECT send_message_v2(
    (SELECT id::TEXT FROM conversations LIMIT 1),
    'test-firebase-uid',
    'Teste da função v2 única',
    'text',
    NULL,
    'arquivo_teste.pdf',
    1024,
    NULL
) as message_id;

SELECT 'Funções v2 únicas criadas com sucesso!' as status;


















