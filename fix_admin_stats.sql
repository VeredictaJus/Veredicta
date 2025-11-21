-- ============================================
-- CORREÇÃO: Estatísticas dos Admins
-- Corrige active_conversations_count e response_count
-- ============================================

-- 1. Corrigir get_admin_status para incluir status 'active' no cálculo
-- ============================================
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
        AND c.status IN ('assigned', 'in_progress', 'active')  -- ✅ Incluído 'active'
        AND c.type = 'support'  -- ✅ Apenas conversas de suporte
    WHERE up.role = 'admin' OR up.role IS NULL
    GROUP BY ap.admin_id, up.full_name, up.email, ap.is_online, ap.status, ap.current_conversation_id, ap.last_seen
    ORDER BY ap.is_online DESC, ap.last_seen DESC;
END;
$$;

-- 2. Criar trigger para incrementar response_count automaticamente quando admin envia mensagem
-- ============================================
-- Primeiro, remover trigger antigo se existir
DROP TRIGGER IF EXISTS increment_response_count_on_admin_message ON messages;

-- Criar função para incrementar response_count
CREATE OR REPLACE FUNCTION increment_response_count_on_admin_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    sender_role TEXT;
    conversation_assigned_to TEXT;
    conversation_type TEXT;
BEGIN
    -- Buscar role do sender
    SELECT role INTO sender_role
    FROM user_profiles
    WHERE firebase_uid = NEW.sender_id;
    
    -- Buscar informações da conversa
    SELECT assigned_to, type INTO conversation_assigned_to, conversation_type
    FROM conversations
    WHERE id = NEW.conversation_id;
    
    -- Incrementar response_count se:
    -- 1. O sender é admin ou support
    -- 2. A conversa é de suporte
    -- 3. A conversa está atribuída a alguém (ou o sender é o admin atribuído)
    IF (sender_role = 'admin' OR sender_role = 'support') 
       AND conversation_type = 'support'
       AND (conversation_assigned_to IS NOT NULL 
            AND conversation_assigned_to != ''
            AND lower(conversation_assigned_to) != 'null') THEN
        
        UPDATE conversations
        SET 
            response_count = COALESCE(response_count, 0) + 1,
            last_admin_activity = NOW()
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER increment_response_count_on_admin_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION increment_response_count_on_admin_message();

-- 3. Atualizar response_count existente baseado em mensagens já enviadas
-- ============================================
UPDATE conversations c
SET response_count = (
    SELECT COUNT(*)
    FROM messages m
    JOIN user_profiles up ON up.firebase_uid = m.sender_id
    WHERE m.conversation_id = c.id
      AND (up.role = 'admin' OR up.role = 'support')
      AND c.type = 'support'
      AND c.assigned_to IS NOT NULL
      AND c.assigned_to != ''
      AND lower(c.assigned_to) != 'null'
)
WHERE c.type = 'support'
  AND c.assigned_to IS NOT NULL
  AND c.assigned_to != ''
  AND lower(c.assigned_to) != 'null';

-- 4. Comentários
-- ============================================
COMMENT ON FUNCTION get_admin_status() IS 'Retorna status de todos os admins com contagem correta de conversas ativas (incluindo status active)';
COMMENT ON FUNCTION increment_response_count_on_admin_message() IS 'Incrementa automaticamente response_count quando admin envia mensagem em conversa de suporte';
COMMENT ON TRIGGER increment_response_count_on_admin_message ON messages IS 'Trigger que incrementa response_count quando admin envia mensagem';

-- ============================================
-- FIM DO SCRIPT
-- ============================================


