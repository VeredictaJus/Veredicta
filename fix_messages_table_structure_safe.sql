-- Fix seguro para estrutura da tabela messages
-- Verifica colunas existentes antes de tentar usá-las

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

-- 3. Copiar dados existentes de forma segura
DO $$
DECLARE
    has_inserted_at BOOLEAN;
    has_attachment_url BOOLEAN;
    has_sent_at BOOLEAN;
    has_status BOOLEAN;
    has_file_type BOOLEAN;
    has_file_name BOOLEAN;
    has_file_size BOOLEAN;
    has_file_url BOOLEAN;
    has_reply_to_id BOOLEAN;
    has_message_type BOOLEAN;
    has_updated_at BOOLEAN;
    has_created_at BOOLEAN;
BEGIN
    -- Verificar quais colunas existem
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'inserted_at'
    ) INTO has_inserted_at;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'attachment_url'
    ) INTO has_attachment_url;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'sent_at'
    ) INTO has_sent_at;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'status'
    ) INTO has_status;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'file_type'
    ) INTO has_file_type;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'file_name'
    ) INTO has_file_name;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'file_size'
    ) INTO has_file_size;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'file_url'
    ) INTO has_file_url;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'reply_to_id'
    ) INTO has_reply_to_id;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'message_type'
    ) INTO has_message_type;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'updated_at'
    ) INTO has_updated_at;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'created_at'
    ) INTO has_created_at;
    
    -- Log das colunas encontradas
    RAISE NOTICE 'Colunas encontradas: inserted_at=%, attachment_url=%, sent_at=%, status=%, file_type=%, file_name=%, file_size=%, file_url=%, reply_to_id=%, message_type=%, updated_at=%, created_at=%', 
        has_inserted_at, has_attachment_url, has_sent_at, has_status, has_file_type, has_file_name, has_file_size, has_file_url, has_reply_to_id, has_message_type, has_updated_at, has_created_at;
    
    -- Copiar dados com base nas colunas existentes
    EXECUTE format('
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
            %s as message_type,
            %s as file_url,
            %s as file_name,
            %s as file_size,
            %s as file_type,
            %s as reply_to_id,
            %s as status,
            %s as created_at,
            %s as updated_at,
            %s as sent_at
        FROM messages
        WHERE id IS NOT NULL',
        CASE WHEN has_message_type THEN 'message_type' ELSE '''text''' END,
        CASE WHEN has_file_url THEN 'file_url' ELSE CASE WHEN has_attachment_url THEN 'attachment_url' ELSE 'NULL' END END,
        CASE WHEN has_file_name THEN 'file_name' ELSE 'NULL' END,
        CASE WHEN has_file_size THEN 'file_size' ELSE 'NULL' END,
        CASE WHEN has_file_type THEN 'file_type' ELSE 'NULL' END,
        CASE WHEN has_reply_to_id THEN 'reply_to_id' ELSE 'NULL' END,
        CASE WHEN has_status THEN 'status' ELSE '''sent''' END,
        CASE WHEN has_created_at THEN 'created_at' ELSE CASE WHEN has_inserted_at THEN 'inserted_at' ELSE 'NOW()' END END,
        CASE WHEN has_updated_at THEN 'updated_at' ELSE 'NOW()' END,
        CASE WHEN has_sent_at THEN 'sent_at' ELSE CASE WHEN has_created_at THEN 'created_at' ELSE CASE WHEN has_inserted_at THEN 'inserted_at' ELSE 'NOW()' END END END
    );
    
    RAISE NOTICE 'Dados copiados com sucesso para messages_temp';
END;
$$;

-- 4. Verificar quantos registros foram copiados
SELECT COUNT(*) as registros_copiados FROM messages_temp;

-- 5. Remover tabela original
DROP TABLE IF EXISTS messages CASCADE;

-- 6. Renomear tabela temporária
ALTER TABLE messages_temp RENAME TO messages;

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- 8. Criar trigger para atualizar updated_at
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

-- 9. Recriar função send_message_v2 com estrutura limpa
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

-- 10. Testar a função
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

-- 11. Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

SELECT 'Estrutura da tabela messages corrigida com sucesso!' as status;
























