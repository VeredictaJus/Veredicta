-- SCRIPT COMPLETO - CORRIGIR TODAS AS TABELAS E COLUNAS
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela message_read_status
SELECT '=== ESTRUTURA message_read_status ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'message_read_status'
ORDER BY ordinal_position;

-- 2. Verificar estrutura atual da tabela conversation_participants
SELECT '=== ESTRUTURA conversation_participants ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'conversation_participants'
ORDER BY ordinal_position;

-- 3. CRIAR COLUNAS NA TABELA message_read_status
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

-- 4. CRIAR COLUNAS NA TABELA conversation_participants
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

-- 5. Remover constraint antiga se existir
ALTER TABLE message_read_status 
DROP CONSTRAINT IF EXISTS message_read_status_message_id_user_id_key;

-- 6. Criar constraint única para (message_id, reader_id)
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

-- 7. Copiar dados de user_id para reader_id se necessário
UPDATE message_read_status 
SET reader_id = user_id::TEXT
WHERE reader_id IS NULL AND user_id IS NOT NULL;

-- 8. Verificar estruturas atualizadas
SELECT '=== ESTRUTURA ATUALIZADA message_read_status ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'message_read_status'
ORDER BY ordinal_position;

SELECT '=== ESTRUTURA ATUALIZADA conversation_participants ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'conversation_participants'
ORDER BY ordinal_position;

-- 9. Verificar constraints
SELECT '=== CONSTRAINTS message_read_status ===' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'message_read_status'
ORDER BY tc.constraint_name, kcu.ordinal_position;

-- 10. Criar função mark_message_as_read_v2
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
    SET 
        last_read_message_id = msg_uuid,
        last_read_at = NOW()
    WHERE user_id = user_text
    AND conversation_id = (SELECT conversation_id FROM messages WHERE id = msg_uuid);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Testar a função
SELECT '=== TESTANDO FUNÇÃO ===' as info;
SELECT mark_message_as_read_v2(
    (SELECT id::TEXT FROM messages LIMIT 1),
    'test-firebase-uid'
) as result;

-- 12. Verificar se os registros foram inseridos
SELECT '=== VERIFICANDO message_read_status ===' as info;
SELECT 
    mrs.message_id,
    mrs.reader_id,
    mrs.read_at
FROM message_read_status mrs
ORDER BY mrs.read_at DESC
LIMIT 5;

SELECT '=== VERIFICANDO conversation_participants ===' as info;
SELECT 
    cp.conversation_id,
    cp.user_id,
    cp.last_read_message_id,
    cp.last_read_at
FROM conversation_participants cp
WHERE cp.last_read_message_id IS NOT NULL
ORDER BY cp.last_read_at DESC
LIMIT 5;

SELECT '=== TODAS AS CORREÇÕES CONCLUÍDAS! ===' as status;


















