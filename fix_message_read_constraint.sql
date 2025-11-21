-- CORRIGIR CONSTRAINT DA TABELA message_read_status
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar constraints existentes na tabela message_read_status
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.is_deferrable,
    tc.initially_deferred
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'message_read_status'
ORDER BY tc.constraint_name, kcu.ordinal_position;

-- 2. Verificar índices existentes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'message_read_status';

-- 3. Remover constraint antiga se existir (message_id, user_id)
ALTER TABLE message_read_status 
DROP CONSTRAINT IF EXISTS message_read_status_message_id_user_id_key;

-- 4. Criar constraint única para (message_id, reader_id)
ALTER TABLE message_read_status 
ADD CONSTRAINT message_read_status_message_id_reader_id_key 
UNIQUE (message_id, reader_id);

-- 5. Se reader_id não existir, criar a coluna
ALTER TABLE message_read_status 
ADD COLUMN IF NOT EXISTS reader_id TEXT;

-- 6. Copiar dados de user_id para reader_id se necessário
UPDATE message_read_status 
SET reader_id = user_id::TEXT
WHERE reader_id IS NULL AND user_id IS NOT NULL;

-- 7. Corrigir função mark_message_as_read_v2
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

-- 8. Testar a função corrigida
SELECT mark_message_as_read_v2(
    (SELECT id::TEXT FROM messages LIMIT 1),
    'test-firebase-uid'
) as result;

-- 9. Verificar se o registro foi inserido
SELECT 
    mrs.message_id,
    mrs.reader_id,
    mrs.read_at
FROM message_read_status mrs
ORDER BY mrs.read_at DESC
LIMIT 5;

SELECT 'Constraint e função corrigidas!' as status;


















