-- CORRIGIR TABELA message_read_status E FUNÇÃO mark_message_as_read_v2
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela message_read_status
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'message_read_status'
ORDER BY ordinal_position;

-- 2. Verificar se a coluna reader_id existe ou se é user_id
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'message_read_status'
AND column_name IN ('reader_id', 'user_id');

-- 3. Se não existir reader_id, adicionar a coluna
ALTER TABLE message_read_status 
ADD COLUMN IF NOT EXISTS reader_id TEXT;

-- 4. Se existir user_id mas não reader_id, copiar dados
UPDATE message_read_status 
SET reader_id = user_id 
WHERE reader_id IS NULL AND user_id IS NOT NULL;

-- 5. Verificar estrutura da tabela messages
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 6. Corrigir função mark_message_as_read_v2
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
    
    -- Inserir registro de leitura (usando reader_id se existir, senão user_id)
    INSERT INTO message_read_status (message_id, reader_id)
    VALUES (msg_uuid, user_text)
    ON CONFLICT (message_id, reader_id) DO NOTHING;

    -- Se reader_id não existir, usar user_id
    -- INSERT INTO message_read_status (message_id, user_id)
    -- VALUES (msg_uuid, user_text)
    -- ON CONFLICT (message_id, user_id) DO NOTHING;

    -- Atualizar last_read_message_id para o participante
    UPDATE conversation_participants
    SET last_read_message_id = msg_uuid
    WHERE user_id = user_text
    AND conversation_id = (SELECT conversation_id FROM messages WHERE id = msg_uuid);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Testar a função corrigida
SELECT mark_message_as_read_v2(
    (SELECT id::TEXT FROM messages LIMIT 1),
    'test-firebase-uid'
) as result;

-- 8. Verificar se o registro foi inserido
SELECT 
    mrs.message_id,
    mrs.reader_id,
    mrs.read_at
FROM message_read_status mrs
ORDER BY mrs.read_at DESC
LIMIT 5;

SELECT 'Função mark_message_as_read_v2 corrigida!' as status;


















