-- Script SQL Mínimo para Sistema de Chat
-- Cria apenas as tabelas básicas sem políticas RLS

-- 1. Remover tabelas existentes (se existirem)
DROP TABLE IF EXISTS message_read_status CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- 2. Criar tabela conversations (básica)
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'active',
    priority VARCHAR(10) DEFAULT 'normal',
    created_by UUID,
    assigned_to UUID,
    petition_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela conversation_participants (básica)
CREATE TABLE conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID,
    role VARCHAR(20) DEFAULT 'client',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- 4. Criar tabela messages (básica)
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela message_read_status (básica)
CREATE TABLE message_read_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- 6. Criar índices básicos
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX idx_message_read_status_user_id ON message_read_status(user_id);

-- 7. Função simples para criar conversa
CREATE OR REPLACE FUNCTION create_conversation(
    p_title TEXT,
    p_type VARCHAR(20),
    p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
    conversation_uuid UUID;
BEGIN
    INSERT INTO conversations (title, type, created_by)
    VALUES (p_title, p_type, p_created_by)
    RETURNING id INTO conversation_uuid;
    
    RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql;

-- 8. Função simples para enviar mensagem
CREATE OR REPLACE FUNCTION send_message(
    p_conversation_id UUID,
    p_sender_id UUID,
    p_content TEXT
)
RETURNS UUID AS $$
DECLARE
    message_uuid UUID;
BEGIN
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (p_conversation_id, p_sender_id, p_content)
    RETURNING id INTO message_uuid;
    
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = p_conversation_id;
    
    RETURN message_uuid;
END;
$$ LANGUAGE plpgsql;

-- 9. Função simples para marcar como lida
CREATE OR REPLACE FUNCTION mark_message_as_read(
    p_message_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO message_read_status (message_id, user_id, read_at)
    VALUES (p_message_id, p_user_id, NOW())
    ON CONFLICT (message_id, user_id) 
    DO UPDATE SET read_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Comentários básicos
COMMENT ON TABLE conversations IS 'Conversas do sistema de chat';
COMMENT ON TABLE conversation_participants IS 'Participantes das conversas';
COMMENT ON TABLE messages IS 'Mensagens das conversas';
COMMENT ON TABLE message_read_status IS 'Status de leitura das mensagens';
