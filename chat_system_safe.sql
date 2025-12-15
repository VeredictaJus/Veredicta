-- Script SQL Seguro para Sistema de Chat Integrado
-- Este script verifica e cria/atualiza as tabelas necessárias

-- 1. Criar tabela conversations se não existir
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar colunas necessárias se não existirem
DO $$ 
BEGIN
    -- Adicionar type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'type') THEN
        ALTER TABLE conversations ADD COLUMN type VARCHAR(20) DEFAULT 'general' CHECK (type IN ('support', 'petition', 'general'));
    END IF;
    
    -- Adicionar status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'status') THEN
        ALTER TABLE conversations ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived'));
    END IF;
    
    -- Adicionar priority se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'priority') THEN
        ALTER TABLE conversations ADD COLUMN priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
    END IF;
    
    -- Adicionar created_by se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'created_by') THEN
        ALTER TABLE conversations ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Adicionar assigned_to se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'assigned_to') THEN
        ALTER TABLE conversations ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    -- Adicionar petition_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'petition_id') THEN
        ALTER TABLE conversations ADD COLUMN petition_id UUID;
    END IF;
    
    -- Adicionar updated_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'updated_at') THEN
        ALTER TABLE conversations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Criar tabela conversation_participants
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'writer', 'admin', 'support')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- 4. Criar tabela messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela message_read_status
CREATE TABLE IF NOT EXISTS message_read_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON message_read_status(user_id);

-- 7. Função para criar uma nova conversa
CREATE OR REPLACE FUNCTION create_conversation(
    p_title TEXT,
    p_type VARCHAR(20),
    p_created_by UUID,
    p_participants UUID[],
    p_participant_roles VARCHAR(20)[]
)
RETURNS UUID AS $$
DECLARE
    conversation_uuid UUID;
    i INTEGER;
BEGIN
    -- Criar a conversa
    INSERT INTO conversations (title, type, created_by)
    VALUES (p_title, p_type, p_created_by)
    RETURNING id INTO conversation_uuid;
    
    -- Adicionar participantes
    FOR i IN 1..array_length(p_participants, 1) LOOP
        INSERT INTO conversation_participants (conversation_id, user_id, role)
        VALUES (conversation_uuid, p_participants[i], p_participant_roles[i]);
    END LOOP;
    
    RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql;

-- 8. Função para enviar mensagem
CREATE OR REPLACE FUNCTION send_message(
    p_conversation_id UUID,
    p_sender_id UUID,
    p_content TEXT,
    p_message_type VARCHAR(20) DEFAULT 'text',
    p_file_url TEXT DEFAULT NULL,
    p_file_name VARCHAR(255) DEFAULT NULL,
    p_file_size INTEGER DEFAULT NULL,
    p_reply_to_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    message_uuid UUID;
BEGIN
    -- Verificar se o usuário é participante da conversa
    IF NOT EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = p_conversation_id 
        AND user_id = p_sender_id
    ) THEN
        RAISE EXCEPTION 'User is not a participant of this conversation';
    END IF;
    
    -- Inserir a mensagem
    INSERT INTO messages (
        conversation_id, sender_id, content, message_type, 
        file_url, file_name, file_size, reply_to_id
    )
    VALUES (
        p_conversation_id, p_sender_id, p_content, p_message_type,
        p_file_url, p_file_name, p_file_size, p_reply_to_id
    )
    RETURNING id INTO message_uuid;
    
    -- Atualizar timestamp da conversa
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = p_conversation_id;
    
    RETURN message_uuid;
END;
$$ LANGUAGE plpgsql;

-- 9. Função para marcar mensagem como lida
CREATE OR REPLACE FUNCTION mark_message_as_read(
    p_message_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Inserir ou atualizar status de leitura
    INSERT INTO message_read_status (message_id, user_id, read_at)
    VALUES (p_message_id, p_user_id, NOW())
    ON CONFLICT (message_id, user_id) 
    DO UPDATE SET read_at = NOW();
    
    -- Atualizar último acesso do participante
    UPDATE conversation_participants 
    SET last_read_at = NOW()
    WHERE user_id = p_user_id 
    AND conversation_id = (
        SELECT conversation_id FROM messages WHERE id = p_message_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Função para obter conversas do usuário
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    title VARCHAR(255),
    type VARCHAR(20),
    status VARCHAR(20),
    priority VARCHAR(10),
    created_by UUID,
    assigned_to UUID,
    last_message_content TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.type,
        c.status,
        c.priority,
        c.created_by,
        c.assigned_to,
        m.content,
        m.created_at,
        COALESCE(unread.unread_count, 0),
        c.created_at,
        c.updated_at
    FROM conversations c
    INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
    LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) m ON TRUE
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as unread_count
        FROM messages msg
        LEFT JOIN message_read_status mrs ON msg.id = mrs.message_id AND mrs.user_id = p_user_id
        WHERE msg.conversation_id = c.id 
        AND msg.sender_id != p_user_id
        AND mrs.read_at IS NULL
    ) unread ON TRUE
    WHERE cp.user_id = p_user_id
    ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 11. RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;

-- Políticas para conversations
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = conversations.id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Admins can update conversations" ON conversations;
CREATE POLICY "Admins can update conversations" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'support')
        )
    );

-- Políticas para conversation_participants
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can join conversations they're invited to" ON conversation_participants;
CREATE POLICY "Users can join conversations they're invited to" ON conversation_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_participants.conversation_id
            AND created_by = auth.uid()
        )
    );

-- Políticas para messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
CREATE POLICY "Users can view messages from their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
CREATE POLICY "Users can send messages to their conversations" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid()
        )
    );

-- Políticas para message_read_status
DROP POLICY IF EXISTS "Users can view read status of their messages" ON message_read_status;
CREATE POLICY "Users can view read status of their messages" ON message_read_status
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM messages m
            INNER JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_read_status.message_id
            AND cp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own read status" ON message_read_status;
CREATE POLICY "Users can update their own read status" ON message_read_status
    FOR ALL USING (user_id = auth.uid());

-- Comentários para documentação
COMMENT ON TABLE conversations IS 'Conversas do sistema de chat integrado';
COMMENT ON TABLE conversation_participants IS 'Participantes das conversas';
COMMENT ON TABLE messages IS 'Mensagens das conversas';
COMMENT ON TABLE message_read_status IS 'Status de leitura das mensagens';

COMMENT ON FUNCTION create_conversation IS 'Cria uma nova conversa com participantes';
COMMENT ON FUNCTION send_message IS 'Envia uma mensagem em uma conversa';
COMMENT ON FUNCTION mark_message_as_read IS 'Marca uma mensagem como lida';
COMMENT ON FUNCTION get_user_conversations IS 'Obtém conversas do usuário com estatísticas';
