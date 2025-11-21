-- Script para configurar armazenamento de áudio no Supabase
-- Este script configura o sistema para suportar upload e armazenamento de áudios

-- 1. Verificar se a tabela messages suporta diferentes tipos de arquivo
-- Adicionar coluna para tipo de arquivo se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'file_type'
    ) THEN
        ALTER TABLE messages ADD COLUMN file_type VARCHAR(50);
    END IF;
END $$;

-- 2. Atualizar colunas existentes para suportar áudio
-- Verificar se attachment_url suporta URLs do Supabase Storage
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'attachment_url'
    ) THEN
        -- A coluna já existe, apenas garantir que suporte URLs longas
        -- (PostgreSQL TEXT já suporta URLs longas)
        NULL;
    ELSE
        -- Se não existir, criar a coluna
        ALTER TABLE messages ADD COLUMN attachment_url TEXT;
    END IF;
END $$;

-- 3. Atualizar coluna file_name para suportar nomes de áudio
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'file_name'
    ) THEN
        ALTER TABLE messages ADD COLUMN file_name VARCHAR(255);
    END IF;
END $$;

-- 4. Atualizar coluna file_size para suportar tamanhos de áudio
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'file_size'
    ) THEN
        ALTER TABLE messages ADD COLUMN file_size BIGINT;
    END IF;
END $$;

-- 5. Criar função para upload de arquivo (simulada)
CREATE OR REPLACE FUNCTION upload_audio_file(
    p_file_name TEXT,
    p_file_size BIGINT,
    p_file_type VARCHAR(50),
    p_conversation_id UUID,
    p_sender_id TEXT,
    p_content TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_message_id UUID;
    file_url TEXT;
BEGIN
    -- Gerar URL simulada para o arquivo (em produção, seria URL do Supabase Storage)
    file_url := 'https://storage.supabase.co/audio/' || p_conversation_id || '/' || p_file_name;
    
    -- Inserir mensagem com arquivo
    INSERT INTO messages (
        conversation_id,
        sender_id,
        content,
        message_type,
        attachment_url,
        file_name,
        file_size,
        file_type
    )
    VALUES (
        p_conversation_id,
        p_sender_id,
        COALESCE(p_content, ''),
        'file',
        file_url,
        p_file_name,
        p_file_size,
        p_file_type
    )
    RETURNING id INTO new_message_id;

    -- Atualizar updated_at da conversa
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = p_conversation_id;

    RETURN new_message_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar função para buscar mensagens com arquivos
CREATE OR REPLACE FUNCTION get_messages_with_files(p_conversation_id UUID)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    sender_id TEXT,
    content TEXT,
    message_type VARCHAR,
    attachment_url TEXT,
    file_name VARCHAR,
    file_size BIGINT,
    file_type VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    is_audio BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.message_type,
        m.attachment_url,
        m.file_name,
        m.file_size,
        m.file_type,
        m.created_at,
        CASE 
            WHEN m.file_type IN ('audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg') 
            OR m.file_name ILIKE '%.wav' 
            OR m.file_name ILIKE '%.mp3' 
            OR m.file_name ILIKE '%.ogg'
            THEN TRUE 
            ELSE FALSE 
        END AS is_audio
    FROM messages m
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 7. Atualizar função send_message para suportar áudio
CREATE OR REPLACE FUNCTION send_message_with_audio(
    p_conversation_id UUID,
    p_sender_id TEXT,
    p_content TEXT,
    p_message_type VARCHAR(20) DEFAULT 'text',
    p_file_url TEXT DEFAULT NULL,
    p_file_name TEXT DEFAULT NULL,
    p_file_size BIGINT DEFAULT NULL,
    p_file_type VARCHAR(50) DEFAULT NULL,
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
        file_type,
        reply_to_id
    )
    VALUES (
        p_conversation_id, 
        p_sender_id, 
        p_content, 
        p_message_type,
        p_file_url,
        p_file_name,
        p_file_size,
        p_file_type,
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

-- 8. Criar políticas RLS para arquivos de áudio (se necessário)
-- Permitir que usuários vejam mensagens com arquivos das suas conversas
CREATE POLICY "Users can view messages with files from their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()::TEXT
        )
    );

-- 9. Comentários para documentação
COMMENT ON FUNCTION upload_audio_file(TEXT, BIGINT, VARCHAR, UUID, TEXT, TEXT) IS 'Simula upload de arquivo de áudio (em produção, integrar com Supabase Storage)';
COMMENT ON FUNCTION get_messages_with_files(UUID) IS 'Retorna mensagens incluindo informações de arquivos e tipo de áudio';
COMMENT ON FUNCTION send_message_with_audio(UUID, TEXT, TEXT, VARCHAR, TEXT, TEXT, BIGINT, VARCHAR, UUID) IS 'Envia mensagem com suporte completo a arquivos de áudio';

-- 10. Verificação final
SELECT 
    'Sistema de áudio configurado' AS status,
    'Tabelas atualizadas para suportar arquivos de áudio' AS description;
