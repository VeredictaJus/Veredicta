-- ============================================
-- SCRIPT PARA VERIFICAR E RECRIAR FUNÇÕES RPC
-- Execute este script no Supabase SQL Editor
-- ============================================

-- Verificar se as funções existem
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_admin_status',
    'get_available_conversations',
    'get_admin_conversations',
    'update_admin_presence',
    'assign_conversation_to_admin',
    'release_conversation'
  )
ORDER BY routine_name;

-- Se alguma função não existir, recriar todas para garantir
-- ============================================

-- Dropar funções antigas
DROP FUNCTION IF EXISTS get_admin_status();
DROP FUNCTION IF EXISTS get_available_conversations();
DROP FUNCTION IF EXISTS get_admin_conversations(TEXT);
DROP FUNCTION IF EXISTS update_admin_presence(TEXT, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS assign_conversation_to_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS release_conversation(UUID, TEXT);

-- Recriar função get_admin_status
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

-- Recriar função get_available_conversations
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

-- Recriar função get_admin_conversations
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

-- Recriar função update_admin_presence
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

-- Recriar função assign_conversation_to_admin
CREATE OR REPLACE FUNCTION assign_conversation_to_admin(
    conversation_id_input UUID,
    admin_id_input TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
    
    UPDATE conversations 
    SET 
        assigned_to = admin_id_input,
        assigned_at = NOW(),
        status = CASE WHEN status = 'closed' THEN 'active' ELSE status END,
        last_admin_activity = NOW()
    WHERE id = conversation_id_input;
    
    INSERT INTO conversation_admin_activity (conversation_id, admin_id, activity_type)
    VALUES (conversation_id_input, admin_id_input, 'assigned')
    ON CONFLICT DO NOTHING;
    
    UPDATE admin_presence 
    SET 
        current_conversation_id = conversation_id_input,
        status = 'busy',
        last_seen = NOW()
    WHERE admin_id = admin_id_input;
    
    RETURN TRUE;
END;
$$;

-- Recriar função release_conversation
CREATE OR REPLACE FUNCTION release_conversation(
    conversation_id_input UUID,
    admin_id_input TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_id_input 
          AND assigned_to = admin_id_input
    ) THEN
        RETURN FALSE;
    END IF;
    
    UPDATE conversations 
    SET 
        assigned_to = NULL,
        assigned_at = NULL,
        status = 'open',
        last_admin_activity = NOW()
    WHERE id = conversation_id_input;
    
    INSERT INTO conversation_admin_activity (conversation_id, admin_id, activity_type)
    VALUES (conversation_id_input, admin_id_input, 'transferred')
    ON CONFLICT DO NOTHING;
    
    UPDATE admin_presence 
    SET 
        current_conversation_id = NULL,
        status = 'available',
        last_seen = NOW()
    WHERE admin_id = admin_id_input;
    
    RETURN TRUE;
END;
$$;

-- Verificar novamente se as funções foram criadas
SELECT 
    routine_name,
    routine_type,
    '✅ Função criada com sucesso' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_admin_status',
    'get_available_conversations',
    'get_admin_conversations',
    'update_admin_presence',
    'assign_conversation_to_admin',
    'release_conversation'
  )
ORDER BY routine_name;

-- ============================================
-- FIM DO SCRIPT
-- ============================================


