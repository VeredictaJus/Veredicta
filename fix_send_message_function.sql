-- Função send_message corrigida para funcionar com Firebase UIDs
-- Esta função substitui as versões anteriores e funciona com TEXT (Firebase UIDs)

-- 1. Remover função antiga se existir
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT, VARCHAR, TEXT, TEXT, BIGINT, UUID);
DROP FUNCTION IF EXISTS send_message(UUID, TEXT, TEXT, VARCHAR, TEXT, TEXT, BIGINT, UUID);

-- 2. Criar nova função send_message com suporte completo
CREATE OR REPLACE FUNCTION send_message(
    p_conversation_id UUID,
    p_sender_id TEXT,  -- Firebase UID como TEXT
    p_content TEXT,
    p_message_type VARCHAR(20) DEFAULT 'text',
    p_file_url TEXT DEFAULT NULL,
    p_file_name TEXT DEFAULT NULL,
    p_file_size BIGINT DEFAULT NULL,
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
        file_url,
        file_name,
        file_size,
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

-- 3. Verificar se a função foi criada corretamente
SELECT proname, proargnames, proargtypes::regtype[]
FROM pg_proc 
WHERE proname = 'send_message';

-- 4. Testar a função (opcional - descomente para testar)
-- SELECT send_message(
--     '00000000-0000-0000-0000-000000000000'::UUID,
--     'test-uid',
--     'Mensagem de teste',
--     'text',
--     NULL,
--     NULL,
--     NULL,
--     NULL
-- );

-- 5. Recarregar schema do PostgREST
SELECT pg_notify('pgrst', 'reload schema');


























