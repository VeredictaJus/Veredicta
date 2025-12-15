-- Sistema de Gerenciamento de Chat para Múltiplos Admins
-- Este script adiciona campos de controle para evitar conflitos entre admins

-- Adicionar colunas de controle às conversas
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed')),
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS last_admin_activity TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS response_count INTEGER DEFAULT 0;

-- Criar tabela de atividade de admins nas conversas
CREATE TABLE IF NOT EXISTS conversation_admin_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('assigned', 'started', 'responded', 'resolved', 'closed', 'transferred')),
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (conversation_id, admin_id, activity_type, created_at)
);

-- Criar tabela de presença de admins
CREATE TABLE IF NOT EXISTS admin_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'away', 'offline')),
    UNIQUE (admin_id)
);

-- Função para atribuir conversa a um admin
CREATE OR REPLACE FUNCTION assign_conversation_to_admin(
    conversation_id_input UUID,
    admin_id_input UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se a conversa existe e está aberta
    IF NOT EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_id_input 
        AND status IN ('open', 'active')
        AND assigned_to IS NULL
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Atribuir conversa ao admin
    UPDATE conversations 
    SET 
        assigned_to = admin_id_input,
        assigned_at = NOW(),
        status = CASE WHEN status = 'closed' THEN 'active' ELSE status END,
        last_admin_activity = NOW()
    WHERE id = conversation_id_input;
    
    -- Registrar atividade
    INSERT INTO conversation_admin_activity (conversation_id, admin_id, activity_type)
    VALUES (conversation_id_input, admin_id_input, 'assigned');
    
    -- Atualizar presença do admin
    UPDATE admin_presence 
    SET 
        current_conversation_id = conversation_id_input,
        status = 'busy',
        last_seen = NOW()
    WHERE admin_id = admin_id_input;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para liberar conversa
CREATE OR REPLACE FUNCTION release_conversation(
    conversation_id_input UUID,
    admin_id_input UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o admin está atribuído à conversa
    IF NOT EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_id_input 
        AND assigned_to = admin_id_input
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Liberar conversa
    UPDATE conversations 
    SET 
        assigned_to = NULL,
        assigned_at = NULL,
        status = 'open',
        last_admin_activity = NOW()
    WHERE id = conversation_id_input;
    
    -- Registrar atividade
    INSERT INTO conversation_admin_activity (conversation_id, admin_id, activity_type)
    VALUES (conversation_id_input, admin_id_input, 'transferred');
    
    -- Atualizar presença do admin
    UPDATE admin_presence 
    SET 
        current_conversation_id = NULL,
        status = 'available',
        last_seen = NOW()
    WHERE admin_id = admin_id_input;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para obter conversas disponíveis para atribuição
CREATE OR REPLACE FUNCTION get_available_conversations()
RETURNS TABLE (
    conversation_id UUID,
    title VARCHAR,
    type VARCHAR,
    priority VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT,
    client_name VARCHAR,
    client_email VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS conversation_id,
        c.title,
        c.type,
        c.priority,
        c.created_at,
        c.updated_at AS last_message_at,
        c.unread_count,
        COALESCE(up.full_name, up.name, 'Cliente') AS client_name,
        up.email AS client_email
    FROM conversations c
    LEFT JOIN user_profiles up ON up.firebase_uid = c.created_by
    WHERE c.status != 'closed'
      AND c.type = 'support'
      AND (
        c.assigned_to IS NULL
        OR c.assigned_to::text = ''
        OR lower(c.assigned_to::text) = 'null'
        OR c.assigned_to::text = 'null'
        OR c.assigned_to::text = 'NULL'
      )
    ORDER BY 
        CASE c.priority 
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'normal' THEN 3
            WHEN 'low' THEN 4
        END,
        c.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter conversas atribuídas a um admin
CREATE OR REPLACE FUNCTION get_admin_conversations(admin_id_input UUID)
RETURNS TABLE (
    conversation_id UUID,
    title VARCHAR,
    type VARCHAR,
    status VARCHAR,
    priority VARCHAR,
    assigned_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT,
    client_name VARCHAR,
    client_email VARCHAR,
    response_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS conversation_id,
        c.title,
        c.type,
        c.status,
        c.priority,
        c.assigned_at,
        c.updated_at AS last_message_at,
        c.unread_count,
        COALESCE(up.full_name, up.name, 'Cliente') AS client_name,
        up.email AS client_email,
        c.response_count
    FROM conversations c
    LEFT JOIN user_profiles up ON up.firebase_uid = c.created_by
    WHERE c.assigned_to = admin_id_input
    AND c.type = 'support'
    ORDER BY 
        CASE c.status 
            WHEN 'in_progress' THEN 1
            WHEN 'assigned' THEN 2
            WHEN 'resolved' THEN 3
            WHEN 'closed' THEN 4
        END,
        c.assigned_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar presença do admin
CREATE OR REPLACE FUNCTION update_admin_presence(
    admin_id_input TEXT,
    is_online_input BOOLEAN,
    status_input VARCHAR DEFAULT 'available'
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO admin_presence (admin_id, is_online, status, last_seen)
    VALUES (admin_id_input::TEXT, is_online_input, status_input, NOW())
    ON CONFLICT (admin_id) 
    DO UPDATE SET
        is_online = is_online_input,
        status = status_input,
        last_seen = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_admin_status()
RETURNS TABLE (
    admin_id TEXT,
    admin_name VARCHAR,
    admin_email VARCHAR,
    is_online BOOLEAN,
    status VARCHAR,
    current_conversation_id UUID,
    last_seen TIMESTAMP WITH TIME ZONE,
    active_conversations_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ap.admin_id,
        COALESCE(up.full_name, up.name, 'Admin') AS admin_name,
        up.email AS admin_email,
        ap.is_online,
        ap.status,
        ap.current_conversation_id,
        ap.last_seen,
        COUNT(c.id) AS active_conversations_count
    FROM admin_presence ap
    LEFT JOIN user_profiles up ON ap.admin_id = up.firebase_uid
    LEFT JOIN conversations c ON c.assigned_to = ap.admin_id AND c.status IN ('assigned', 'in_progress')
    WHERE up.role = 'admin'
    GROUP BY ap.admin_id, up.full_name, up.name, up.email, ap.is_online, ap.status, ap.current_conversation_id, ap.last_seen
    ORDER BY ap.is_online DESC, ap.last_seen DESC;
END;
$$ LANGUAGE plpgsql;

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_priority ON conversations(priority);
CREATE INDEX IF NOT EXISTS idx_conversation_admin_activity_conversation_id ON conversation_admin_activity(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_admin_activity_admin_id ON conversation_admin_activity(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_presence_admin_id ON admin_presence(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_presence_is_online ON admin_presence(is_online);

-- Comentários para documentação
COMMENT ON COLUMN conversations.assigned_to IS 'Admin responsável pela conversa';
COMMENT ON COLUMN conversations.assigned_at IS 'Data/hora da atribuição';
COMMENT ON COLUMN conversations.status IS 'Status da conversa: open, assigned, in_progress, resolved, closed';
COMMENT ON COLUMN conversations.priority IS 'Prioridade da conversa: low, normal, high, urgent';
COMMENT ON COLUMN conversations.last_admin_activity IS 'Última atividade de um admin na conversa';
COMMENT ON COLUMN conversations.response_count IS 'Número de respostas dos admins';

COMMENT ON TABLE conversation_admin_activity IS 'Registra atividades dos admins nas conversas';
COMMENT ON TABLE admin_presence IS 'Controla presença e status dos admins';

COMMENT ON FUNCTION assign_conversation_to_admin(UUID, UUID) IS 'Atribui uma conversa a um admin específico';
COMMENT ON FUNCTION release_conversation(UUID, UUID) IS 'Libera uma conversa atribuída a um admin';
COMMENT ON FUNCTION get_available_conversations() IS 'Retorna conversas disponíveis para atribuição';
COMMENT ON FUNCTION get_admin_conversations(UUID) IS 'Retorna conversas atribuídas a um admin específico';
COMMENT ON FUNCTION update_admin_presence(UUID, BOOLEAN, VARCHAR) IS 'Atualiza presença e status de um admin';
COMMENT ON FUNCTION get_admin_status() IS 'Retorna status de todos os admins';
