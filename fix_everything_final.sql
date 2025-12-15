-- SCRIPT COMPLETO E DEFINITIVO - CORRIGIR TODAS AS FUNÇÕES E TABELAS
-- Execute este SQL no Supabase SQL Editor

-- ==============================================================================
-- PARTE 1: CRIAR COLUNAS NECESSÁRIAS
-- ==============================================================================

-- 1. Criar colunas na tabela message_read_status
DO $$
BEGIN
    -- Criar reader_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'message_read_status' 
        AND column_name = 'reader_id'
    ) THEN
        ALTER TABLE message_read_status ADD COLUMN reader_id TEXT;
        RAISE NOTICE 'Coluna reader_id criada na tabela message_read_status';
    ELSE
        RAISE NOTICE 'Coluna reader_id já existe na tabela message_read_status';
    END IF;

    -- Criar read_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'message_read_status' 
        AND column_name = 'read_at'
    ) THEN
        ALTER TABLE message_read_status ADD COLUMN read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna read_at criada na tabela message_read_status';
    ELSE
        RAISE NOTICE 'Coluna read_at já existe na tabela message_read_status';
    END IF;
END $$;

-- 2. Criar colunas na tabela conversation_participants
DO $$
BEGIN
    -- Criar last_read_message_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'last_read_message_id'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN last_read_message_id UUID REFERENCES messages(id);
        RAISE NOTICE 'Coluna last_read_message_id criada na tabela conversation_participants';
    ELSE
        RAISE NOTICE 'Coluna last_read_message_id já existe na tabela conversation_participants';
    END IF;

    -- Criar last_read_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'last_read_at'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna last_read_at criada na tabela conversation_participants';
    ELSE
        RAISE NOTICE 'Coluna last_read_at já existe na tabela conversation_participants';
    END IF;
END $$;

-- 3. Remover constraint antiga e criar nova
ALTER TABLE message_read_status DROP CONSTRAINT IF EXISTS message_read_status_message_id_user_id_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'message_read_status' 
        AND constraint_name = 'message_read_status_message_id_reader_id_key'
    ) THEN
        ALTER TABLE message_read_status 
        ADD CONSTRAINT message_read_status_message_id_reader_id_key 
        UNIQUE (message_id, reader_id);
        RAISE NOTICE 'Constraint única criada para (message_id, reader_id)';
    ELSE
        RAISE NOTICE 'Constraint única já existe para (message_id, reader_id)';
    END IF;
END $$;

-- 4. Copiar dados de user_id para reader_id se necessário
UPDATE message_read_status 
SET reader_id = user_id::TEXT
WHERE reader_id IS NULL AND user_id IS NOT NULL;

-- ==============================================================================
-- PARTE 2: CRIAR/ATUALIZAR FUNÇÕES
-- ==============================================================================

-- 5. Função send_message_v2
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
    -- Converter conversation_id para UUID
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

-- 6. Função get_conversation_messages_v2 com TODOS os casts
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
    -- Converter conversation_id para UUID
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
        COALESCE(m.file_size, 0)::BIGINT,  -- 🔥 CAST EXPLÍCITO + COALESCE
        m.sent_at,
        m.message_type,
        NULL::TEXT as reply_to_message_id,
        EXISTS (
            SELECT 1 FROM message_read_status mrs
            WHERE mrs.message_id = m.id
            AND mrs.reader_id = auth.uid()::TEXT  -- 🔥 CAST EXPLÍCITO
        ) AS is_read
    FROM messages m
    WHERE m.conversation_id = conv_uuid
    ORDER BY m.sent_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função mark_message_as_read_v2
CREATE OR REPLACE FUNCTION mark_message_as_read_v2(
    p_message_id TEXT,
    p_user_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    msg_uuid UUID;
    user_text TEXT;
BEGIN
    -- Converter message_id para UUID
    BEGIN
        msg_uuid := p_message_id::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'ID de mensagem inválido: %', p_message_id;
    END;
    
    -- Usar user_id como TEXT (Firebase UID)
    user_text := p_user_id;
    
    -- Inserir registro de leitura
    INSERT INTO message_read_status (message_id, reader_id, read_at)
    VALUES (msg_uuid, user_text, NOW())
    ON CONFLICT (message_id, reader_id) DO NOTHING;

    -- Atualizar last_read_message_id para o participante
    UPDATE conversation_participants
    SET 
        last_read_message_id = msg_uuid,
        last_read_at = NOW()
    WHERE user_id = user_text
    AND conversation_id = (SELECT conversation_id FROM messages WHERE id = msg_uuid);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- PARTE 3: TESTES
-- ==============================================================================

-- 8. Testar envio de mensagem
SELECT '=== TESTANDO ENVIO DE MENSAGEM ===' as info;
SELECT send_message_v2(
    '550e8400-e29b-41d4-a716-446655440000',
    'test-firebase-uid-final',
    'Mensagem de teste - correção completa e definitiva',
    'text',
    NULL,
    NULL,
    NULL,
    NULL
) as new_message_id;

-- 9. Verificar se a mensagem foi inserida
SELECT '=== VERIFICAR MENSAGEM INSERIDA ===' as info;
SELECT 
    id::TEXT as id,
    conversation_id::TEXT as conversation_id,
    sender_id::TEXT as sender_id,
    content,
    sent_at
FROM messages
WHERE content LIKE '%correção completa e definitiva%'
ORDER BY sent_at DESC
LIMIT 1;

-- 10. Testar carregamento de mensagens
SELECT '=== TESTANDO CARREGAMENTO DE MENSAGENS ===' as info;
SELECT * FROM get_conversation_messages_v2('550e8400-e29b-41d4-a716-446655440000');

-- 11. Contar total de mensagens
SELECT '=== TOTAL DE MENSAGENS ===' as info;
SELECT COUNT(*) as total FROM messages 
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000';

-- 12. Ver últimas mensagens
SELECT '=== ÚLTIMAS 5 MENSAGENS ===' as info;
SELECT 
    id::TEXT,
    sender_id::TEXT,
    content,
    sent_at
FROM messages
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY sent_at DESC
LIMIT 5;

SELECT '=== ✅ TODAS AS CORREÇÕES APLICADAS COM SUCESSO! ===' as status;


















