-- CORRIGIR TABELA conversation_participants - ADICIONAR COLUNA last_read_message_id
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela conversation_participants
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'conversation_participants'
ORDER BY ordinal_position;

-- 2. Adicionar coluna last_read_message_id se não existir
ALTER TABLE conversation_participants 
ADD COLUMN IF NOT EXISTS last_read_message_id UUID REFERENCES messages(id);

-- 3. Adicionar coluna last_read_at se não existir
ALTER TABLE conversation_participants 
ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Verificar estrutura atualizada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'conversation_participants'
ORDER BY ordinal_position;

-- 5. Corrigir função mark_message_as_read_v2
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
    
    -- Inserir registro de leitura usando reader_id
    INSERT INTO message_read_status (message_id, reader_id, read_at)
    VALUES (msg_uuid, user_text, NOW())
    ON CONFLICT (message_id, reader_id) DO NOTHING;

    -- Atualizar last_read_message_id para o participante (se a coluna existir)
    UPDATE conversation_participants
    SET 
        last_read_message_id = msg_uuid,
        last_read_at = NOW()
    WHERE user_id = user_text
    AND conversation_id = (SELECT conversation_id FROM messages WHERE id = msg_uuid);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Testar a função corrigida
SELECT mark_message_as_read_v2(
    (SELECT id::TEXT FROM messages LIMIT 1),
    'test-firebase-uid'
) as result;

-- 7. Verificar se o registro foi inserido na message_read_status
SELECT 
    mrs.message_id,
    mrs.reader_id,
    mrs.read_at
FROM message_read_status mrs
ORDER BY mrs.read_at DESC
LIMIT 5;

-- 8. Verificar se conversation_participants foi atualizado
SELECT 
    cp.conversation_id,
    cp.user_id,
    cp.last_read_message_id,
    cp.last_read_at
FROM conversation_participants cp
WHERE cp.last_read_message_id IS NOT NULL
ORDER BY cp.last_read_at DESC
LIMIT 5;

SELECT 'Colunas adicionadas à conversation_participants!' as status;