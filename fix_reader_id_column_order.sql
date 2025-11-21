-- CORRIGIR ORDEM DAS OPERAÇÕES - CRIAR COLUNA PRIMEIRO
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

-- 2. Verificar constraints existentes
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'message_read_status'
ORDER BY tc.constraint_name, kcu.ordinal_position;

-- 3. PRIMEIRO: Criar a coluna reader_id se não existir
ALTER TABLE message_read_status 
ADD COLUMN IF NOT EXISTS reader_id TEXT;

-- 4. Copiar dados de user_id para reader_id se necessário
UPDATE message_read_status 
SET reader_id = user_id::TEXT
WHERE reader_id IS NULL AND user_id IS NOT NULL;

-- 5. Remover constraint antiga se existir (message_id, user_id)
ALTER TABLE message_read_status 
DROP CONSTRAINT IF EXISTS message_read_status_message_id_user_id_key;

-- 6. AGORA criar constraint única para (message_id, reader_id)
ALTER TABLE message_read_status 
ADD CONSTRAINT message_read_status_message_id_reader_id_key 
UNIQUE (message_id, reader_id);

-- 7. Verificar se a constraint foi criada
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'message_read_status'
ORDER BY tc.constraint_name, kcu.ordinal_position;

-- 8. Corrigir função mark_message_as_read_v2
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

    -- Atualizar last_read_message_id para o participante
    UPDATE conversation_participants
    SET last_read_message_id = msg_uuid
    WHERE user_id = user_text
    AND conversation_id = (SELECT conversation_id FROM messages WHERE id = msg_uuid);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Testar a função corrigida
SELECT mark_message_as_read_v2(
    (SELECT id::TEXT FROM messages LIMIT 1),
    'test-firebase-uid'
) as result;

-- 10. Verificar se o registro foi inserido
SELECT 
    mrs.message_id,
    mrs.reader_id,
    mrs.read_at
FROM message_read_status mrs
ORDER BY mrs.read_at DESC
LIMIT 5;

SELECT 'Coluna reader_id criada e constraint adicionada!' as status;


















