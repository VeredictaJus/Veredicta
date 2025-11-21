-- SQL para Corrigir Problemas de Envio de Mensagens
-- Execute este SQL no Supabase SQL Editor

-- Remover função existente
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT, VARCHAR, TEXT, TEXT, BIGINT, UUID);

-- Recriar função send_message com tratamento de erro
CREATE OR REPLACE FUNCTION send_message(
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
    
    -- Verificar se o usuário existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_sender_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado: %', p_sender_id;
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
        reply_to_message_id,
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
        p_reply_to_id,
        NOW()
    )
    RETURNING id INTO new_message_id;

    -- Atualizar updated_at da conversa
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = p_conversation_id;

    RETURN new_message_id;
END;
$$ LANGUAGE plpgsql;

-- Testar a função
SELECT 'Função send_message criada com sucesso!' as status;


















