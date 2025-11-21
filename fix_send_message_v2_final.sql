-- Fix final para função send_message_v2
-- Esta versão deve funcionar corretamente com o sistema atual

-- 1. Remover função existente se houver
DROP FUNCTION IF EXISTS send_message_v2(UUID, TEXT, TEXT, VARCHAR, TEXT, TEXT, BIGINT, UUID);

-- 2. Criar função send_message_v2 corrigida
CREATE OR REPLACE FUNCTION send_message_v2(
    p_conversation_id UUID,
    p_sender_id TEXT,
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
    conversation_exists BOOLEAN;
BEGIN
    -- Verificar se a conversa existe
    SELECT EXISTS(SELECT 1 FROM conversations WHERE id = p_conversation_id) INTO conversation_exists;
    
    IF NOT conversation_exists THEN
        RAISE EXCEPTION 'Conversa não encontrada: %', p_conversation_id;
    END IF;
    
    -- Inserir a mensagem
    INSERT INTO messages (
        conversation_id, 
        sender_id, 
        content, 
        message_type,
        file_url,
        file_name,
        file_size,
        reply_to_id,
        sent_at,
        created_at,
        updated_at
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
        NOW(),
        NOW(),
        NOW()
    )
    RETURNING id INTO new_message_id;

    -- Atualizar updated_at da conversa
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = p_conversation_id;

    -- Log para debug
    RAISE NOTICE 'Mensagem inserida com sucesso. ID: %, Content: %', new_message_id, p_content;

    RETURN new_message_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao inserir mensagem: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Testar a função
DO $$
DECLARE
    test_conversation_id UUID;
    test_message_id UUID;
BEGIN
    -- Pegar uma conversa existente para teste
    SELECT id INTO test_conversation_id FROM conversations LIMIT 1;
    
    IF test_conversation_id IS NOT NULL THEN
        -- Testar inserção
        SELECT send_message_v2(
            test_conversation_id,
            'test-user-id',
            'Teste da função send_message_v2 corrigida',
            'text',
            NULL,
            NULL,
            NULL,
            NULL
        ) INTO test_message_id;
        
        RAISE NOTICE 'Teste bem-sucedido! Mensagem inserida com ID: %', test_message_id;
        
        -- Verificar se a mensagem foi realmente inserida
        IF EXISTS (SELECT 1 FROM messages WHERE id = test_message_id) THEN
            RAISE NOTICE 'Mensagem confirmada no banco de dados!';
        ELSE
            RAISE NOTICE 'ERRO: Mensagem não foi encontrada no banco!';
        END IF;
    ELSE
        RAISE NOTICE 'Nenhuma conversa encontrada para teste';
    END IF;
END;
$$;

-- 4. Verificar se a função foi criada corretamente
SELECT 'Função send_message_v2 corrigida criada com sucesso!' as status;

-- 5. Verificar estrutura da tabela messages
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;
























