-- ============================================
-- SCRIPT COMPLETO E CORRIGIDO PARA CHAT ADMIN
-- Execute este script no Supabase SQL Editor
-- ============================================

-- PASSO 1: Remover TODAS as constraints de foreign key problemáticas PRIMEIRO
-- ============================================

-- Remover constraints de foreign key que referenciam UUID (devem ser removidas ANTES de alterar tipos)
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_assigned_to_fkey;
ALTER TABLE admin_presence DROP CONSTRAINT IF EXISTS admin_presence_admin_id_fkey;
ALTER TABLE conversation_admin_activity DROP CONSTRAINT IF EXISTS conversation_admin_activity_admin_id_fkey;

-- PASSO 2: Alterar colunas para TEXT (Firebase UIDs são TEXT)
-- ============================================

-- Alterar assigned_to de UUID para TEXT
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'conversations' AND column_name = 'assigned_to' 
                AND data_type = 'uuid') THEN
        ALTER TABLE conversations 
        ALTER COLUMN assigned_to TYPE TEXT USING assigned_to::TEXT;
    END IF;
END $$;

-- Alterar admin_id em admin_presence de UUID para TEXT
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'admin_presence' AND column_name = 'admin_id' 
                AND data_type = 'uuid') THEN
        ALTER TABLE admin_presence 
        ALTER COLUMN admin_id TYPE TEXT USING admin_id::TEXT;
    END IF;
END $$;

-- Alterar admin_id em conversation_admin_activity de UUID para TEXT
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'conversation_admin_activity' AND column_name = 'admin_id' 
                AND data_type = 'uuid') THEN
        ALTER TABLE conversation_admin_activity 
        ALTER COLUMN admin_id TYPE TEXT USING admin_id::TEXT;
    END IF;
END $$;

-- PASSO 3: Dropar TODAS as funções antigas (para evitar conflito de overload)
-- ============================================

DROP FUNCTION IF EXISTS assign_conversation_to_admin(UUID, UUID);
DROP FUNCTION IF EXISTS assign_conversation_to_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS release_conversation(UUID, UUID);
DROP FUNCTION IF EXISTS release_conversation(UUID, TEXT);
DROP FUNCTION IF EXISTS get_available_conversations();
DROP FUNCTION IF EXISTS get_admin_conversations(UUID);
DROP FUNCTION IF EXISTS get_admin_conversations(TEXT);
DROP FUNCTION IF EXISTS update_admin_presence(UUID, BOOLEAN, VARCHAR);
DROP FUNCTION IF EXISTS update_admin_presence(TEXT, BOOLEAN, VARCHAR);
DROP FUNCTION IF EXISTS update_admin_presence(TEXT, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS get_admin_status();

-- PASSO 4: Criar funções CORRIGIDAS com TEXT
-- ============================================

-- Função para atribuir conversa a um admin
CREATE OR REPLACE FUNCTION assign_conversation_to_admin(
    conversation_id_input UUID,
    admin_id_input TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se a conversa existe e está aberta/disponível
    IF NOT EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_id_input 
          AND status IN ('open', 'active')
          AND (
            assigned_to IS NULL 
            OR assigned_to = '' 
            OR lower(assigned_to) = 'null'
          )
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
    
    -- Registrar atividade (se a tabela existir)
    INSERT INTO conversation_admin_activity (conversation_id, admin_id, activity_type)
    VALUES (conversation_id_input, admin_id_input, 'assigned')
    ON CONFLICT DO NOTHING;
    
    -- Atualizar presença do admin
    UPDATE admin_presence 
    SET 
        current_conversation_id = conversation_id_input,
        status = 'busy',
        last_seen = NOW()
    WHERE admin_id = admin_id_input;
    
    RETURN TRUE;
END;
$$;

-- Função para liberar conversa
CREATE OR REPLACE FUNCTION release_conversation(
    conversation_id_input UUID,
    admin_id_input TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    VALUES (conversation_id_input, admin_id_input, 'transferred')
    ON CONFLICT DO NOTHING;
    
    -- Atualizar presença do admin
    UPDATE admin_presence 
    SET 
        current_conversation_id = NULL,
        status = 'available',
        last_seen = NOW()
    WHERE admin_id = admin_id_input;
    
    RETURN TRUE;
END;
$$;

-- Função para obter conversas disponíveis para atribuição
CREATE OR REPLACE FUNCTION get_available_conversations()
RETURNS TABLE (
    conversation_id UUID,
    title TEXT,
    type TEXT,
    priority TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT,
    client_name TEXT,
    client_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS conversation_id,
        c.title::TEXT,
        c.type::TEXT,
        c.priority::TEXT,
        c.created_at,
        COALESCE(c.last_message_at, c.updated_at) AS last_message_at,
        COALESCE(c.unread_count, 0)::BIGINT AS unread_count,
        COALESCE(up.full_name, 'Cliente')::TEXT AS client_name,
        COALESCE(up.email, '')::TEXT AS client_email
    FROM conversations c
    LEFT JOIN user_profiles up ON up.firebase_uid = c.created_by
    WHERE c.status != 'closed'
      AND c.type = 'support'
      AND (
        c.assigned_to IS NULL
        OR c.assigned_to = ''
        OR lower(c.assigned_to) = 'null'
      )
    ORDER BY 
        CASE c.priority 
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'normal' THEN 3
            WHEN 'low' THEN 4
            ELSE 5
        END,
        c.created_at ASC;
END;
$$;

-- Função para obter conversas atribuídas a um admin
CREATE OR REPLACE FUNCTION get_admin_conversations(admin_id_input TEXT)
RETURNS TABLE (
    conversation_id UUID,
    title TEXT,
    type TEXT,
    status TEXT,
    priority TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT,
    client_name TEXT,
    client_email TEXT,
    response_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS conversation_id,
        c.title::TEXT,
        c.type::TEXT,
        c.status::TEXT,
        c.priority::TEXT,
        c.assigned_at,
        COALESCE(c.last_message_at, c.updated_at) AS last_message_at,
        COALESCE(c.unread_count, 0)::BIGINT AS unread_count,
        COALESCE(up.full_name, 'Cliente')::TEXT AS client_name,
        COALESCE(up.email, '')::TEXT AS client_email,
        COALESCE(c.response_count, 0) AS response_count
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
            ELSE 5
        END,
        c.assigned_at ASC NULLS LAST;
END;
$$;

-- Função para atualizar presença do admin
CREATE OR REPLACE FUNCTION update_admin_presence(
    admin_id_input TEXT,
    is_online_input BOOLEAN,
    status_input TEXT DEFAULT 'available'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO admin_presence (admin_id, is_online, status, last_seen)
    VALUES (admin_id_input, is_online_input, status_input, NOW())
    ON CONFLICT (admin_id) 
    DO UPDATE SET
        is_online = is_online_input,
        status = status_input,
        last_seen = NOW();
    
    RETURN TRUE;
END;
$$;

-- Função para obter status de todos os admins
CREATE OR REPLACE FUNCTION get_admin_status()
RETURNS TABLE (
    admin_id TEXT,
    admin_name TEXT,
    admin_email TEXT,
    is_online BOOLEAN,
    status TEXT,
    current_conversation_id UUID,
    last_seen TIMESTAMP WITH TIME ZONE,
    active_conversations_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ap.admin_id::TEXT,
        COALESCE(up.full_name, 'Admin')::TEXT AS admin_name,
        COALESCE(up.email, '')::TEXT AS admin_email,
        ap.is_online,
        ap.status::TEXT,
        ap.current_conversation_id,
        ap.last_seen,
        COUNT(c.id)::BIGINT AS active_conversations_count
    FROM admin_presence ap
    LEFT JOIN user_profiles up ON ap.admin_id = up.firebase_uid
    LEFT JOIN conversations c ON c.assigned_to = ap.admin_id::TEXT 
        AND c.status IN ('assigned', 'in_progress')
    WHERE up.role = 'admin' OR up.role IS NULL
    GROUP BY ap.admin_id, up.full_name, up.email, ap.is_online, ap.status, ap.current_conversation_id, ap.last_seen
    ORDER BY ap.is_online DESC, ap.last_seen DESC;
END;
$$;

-- PASSO 5: Garantir que a tabela admin_presence existe com a estrutura correta
-- ============================================
-- NOTA: Não criamos foreign key para admin_id porque ele é TEXT (Firebase UID)
-- e não referencia auth.users(id) que é UUID

-- Se a tabela não existe, criar
CREATE TABLE IF NOT EXISTS admin_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id TEXT NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'away', 'offline'))
);

-- Garantir que admin_id é TEXT (se a tabela já existia)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'admin_presence' AND column_name = 'admin_id' 
                AND data_type != 'text') THEN
        -- Remover constraint UNIQUE se existir antes de alterar
        ALTER TABLE admin_presence DROP CONSTRAINT IF EXISTS admin_presence_admin_id_key;
        ALTER TABLE admin_presence DROP CONSTRAINT IF EXISTS admin_presence_admin_id_fkey;
        -- Alterar tipo
        ALTER TABLE admin_presence ALTER COLUMN admin_id TYPE TEXT USING admin_id::TEXT;
        -- Recriar constraint UNIQUE
        CREATE UNIQUE INDEX IF NOT EXISTS admin_presence_admin_id_unique ON admin_presence(admin_id);
    END IF;
END $$;

-- Garantir constraint UNIQUE em admin_id (sem foreign key)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                   WHERE conname = 'admin_presence_admin_id_key' 
                   OR conname = 'admin_presence_admin_id_unique') THEN
        CREATE UNIQUE INDEX IF NOT EXISTS admin_presence_admin_id_unique ON admin_presence(admin_id);
    END IF;
END $$;

-- PASSO 6: Garantir que a tabela conversation_admin_activity existe com a estrutura correta
-- ============================================

CREATE TABLE IF NOT EXISTS conversation_admin_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    admin_id TEXT NOT NULL,
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('assigned', 'started', 'responded', 'resolved', 'closed', 'transferred')),
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 7: Criar índices para otimização
-- ============================================

CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_priority ON conversations(priority);
CREATE INDEX IF NOT EXISTS idx_conversation_admin_activity_conversation_id ON conversation_admin_activity(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_admin_activity_admin_id ON conversation_admin_activity(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_presence_admin_id ON admin_presence(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_presence_is_online ON admin_presence(is_online);

-- PASSO 8: Comentários para documentação
-- ============================================

COMMENT ON COLUMN conversations.assigned_to IS 'Admin responsável pela conversa (TEXT - Firebase UID)';
COMMENT ON COLUMN conversations.assigned_at IS 'Data/hora da atribuição';
COMMENT ON COLUMN conversations.status IS 'Status da conversa: open, assigned, in_progress, resolved, closed';
COMMENT ON COLUMN conversations.priority IS 'Prioridade da conversa: low, normal, high, urgent';
COMMENT ON COLUMN conversations.last_admin_activity IS 'Última atividade de um admin na conversa';
COMMENT ON COLUMN conversations.response_count IS 'Número de respostas dos admins';

COMMENT ON TABLE conversation_admin_activity IS 'Registra atividades dos admins nas conversas';
COMMENT ON TABLE admin_presence IS 'Controla presença e status dos admins';

COMMENT ON FUNCTION assign_conversation_to_admin(UUID, TEXT) IS 'Atribui uma conversa a um admin específico';
COMMENT ON FUNCTION release_conversation(UUID, TEXT) IS 'Libera uma conversa atribuída a um admin';
COMMENT ON FUNCTION get_available_conversations() IS 'Retorna conversas disponíveis para atribuição';
COMMENT ON FUNCTION get_admin_conversations(TEXT) IS 'Retorna conversas atribuídas a um admin específico';
COMMENT ON FUNCTION update_admin_presence(TEXT, BOOLEAN, TEXT) IS 'Atualiza presença e status de um admin';
COMMENT ON FUNCTION get_admin_status() IS 'Retorna status de todos os admins';

-- ============================================
-- FIM DO SCRIPT
-- ============================================

