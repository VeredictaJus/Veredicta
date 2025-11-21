-- Fix para estrutura da tabela messages
-- Remover colunas duplicadas e conflitantes

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 2. Criar tabela temporária com estrutura limpa
CREATE TABLE IF NOT EXISTS messages_temp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(100),
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Copiar dados existentes (apenas colunas válidas)
INSERT INTO messages_temp (
    id,
    conversation_id,
    sender_id,
    content,
    message_type,
    file_url,
    file_name,
    file_size,
    file_type,
    reply_to_id,
    status,
    created_at,
    updated_at,
    sent_at
)
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    COALESCE(message_type, 'text') as message_type,
    COALESCE(file_url, attachment_url) as file_url,
    file_name,
    file_size,
    file_type,
    reply_to_id,
    COALESCE(status, 'sent') as status,
    COALESCE(created_at, inserted_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at,
    COALESCE(sent_at, created_at, inserted_at, NOW()) as sent_at
FROM messages
WHERE id IS NOT NULL;

-- 4. Remover tabela original
DROP TABLE IF EXISTS messages CASCADE;

-- 5. Renomear tabela temporária
ALTER TABLE messages_temp RENAME TO messages;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- 7. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- 8. Recriar função send_message_v2 com estrutura limpa
CREATE OR REPLACE FUNCTION send_message_v2(
    p_conversation_id UUID,
    p_sender_id TEXT,
    p_content TEXT,
    p_message_type VARCHAR DEFAULT 'text',
    p_file_url TEXT DEFAULT NULL,
    p_file_name TEXT DEFAULT NULL,
    p_file_size INTEGER DEFAULT NULL,
    p_file_type VARCHAR DEFAULT NULL,
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
        file_type,
        reply_to_id,
        status,
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
        p_file_type,
        p_reply_to_id,
        'sent',
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

-- 9. Testar a função
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
            'Teste da função send_message_v2 com estrutura limpa',
            'text',
            NULL,
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

-- 10. Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

SELECT 'Estrutura da tabela messages corrigida com sucesso!' as status;
























