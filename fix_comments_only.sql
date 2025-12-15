-- Execute apenas esta parte se os COMMENTs estiverem dando erro
-- Copie e cole no Supabase SQL Editor

COMMENT ON FUNCTION assign_conversation_to_admin(UUID, TEXT) IS 'Atribui uma conversa a um admin específico';
COMMENT ON FUNCTION release_conversation(UUID, TEXT) IS 'Libera uma conversa atribuída a um admin';
COMMENT ON FUNCTION get_available_conversations() IS 'Retorna conversas disponíveis para atribuição';
COMMENT ON FUNCTION get_admin_conversations(TEXT) IS 'Retorna conversas atribuídas a um admin específico';
COMMENT ON FUNCTION update_admin_presence(TEXT, BOOLEAN, TEXT) IS 'Atualiza presença e status de um admin';
COMMENT ON FUNCTION get_admin_status() IS 'Retorna status de todos os admins';


