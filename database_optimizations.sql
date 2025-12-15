-- ============================================================
-- OTIMIZAÇÕES DE BANCO DE DADOS PARA REDUZIR DISK IO
-- ============================================================
-- Este arquivo contém índices e otimizações para melhorar
-- a performance do chat e reduzir o consumo de Disk IO
-- ============================================================

-- 🚀 ÍNDICES PARA TABELA conversations
-- ============================================================

-- Índice para buscar conversas por created_by (usado em getUserConversations)
CREATE INDEX IF NOT EXISTS idx_conversations_created_by 
ON conversations(created_by);

-- Índice para buscar conversas por updated_at (usado para ordenação)
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
ON conversations(updated_at DESC);

-- Índice composto para buscar conversas ativas do usuário
CREATE INDEX IF NOT EXISTS idx_conversations_created_by_status 
ON conversations(created_by, status);

-- Índice para buscar por tipo de conversa
CREATE INDEX IF NOT EXISTS idx_conversations_type 
ON conversations(type);


-- 🚀 ÍNDICES PARA TABELA conversation_participants
-- ============================================================

-- Índice para buscar participações por user_id (usado em getUserConversations)
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id 
ON conversation_participants(user_id);

-- Índice para buscar participantes por conversation_id
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id 
ON conversation_participants(conversation_id);

-- Índice composto para buscar participações ativas
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_conversation 
ON conversation_participants(user_id, conversation_id);


-- 🚀 ÍNDICES PARA TABELA messages
-- ============================================================

-- Índice para buscar mensagens por conversation_id (usado frequentemente)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

-- Índice para buscar mensagens por sender_id
CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
ON messages(sender_id);

-- Índice para buscar mensagens por created_at (usado para ordenação)
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at DESC);

-- Índice composto para buscar mensagens de uma conversa ordenadas
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- Índice para buscar mensagens por status
CREATE INDEX IF NOT EXISTS idx_messages_status 
ON messages(status);


-- 🚀 OTIMIZAÇÕES DE PERFORMANCE
-- ============================================================

-- Atualizar estatísticas das tabelas para melhorar o query planner
ANALYZE conversations;
ANALYZE conversation_participants;
ANALYZE messages;


-- 🚀 CONFIGURAÇÕES RECOMENDADAS (EXECUTAR COM CUIDADO)
-- ============================================================
-- Estas configurações podem melhorar a performance, mas devem
-- ser testadas em ambiente de desenvolvimento primeiro

-- Comentado por segurança - descomente se necessário:
-- ALTER TABLE conversations SET (fillfactor = 90);
-- ALTER TABLE conversation_participants SET (fillfactor = 90);
-- ALTER TABLE messages SET (fillfactor = 80);


-- 🚀 VERIFICAÇÃO DOS ÍNDICES
-- ============================================================
-- Execute esta query para verificar se os índices foram criados:

-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('conversations', 'conversation_participants', 'messages')
-- ORDER BY tablename, indexname;


-- 🚀 MONITORAMENTO DE DISK IO
-- ============================================================
-- Execute esta query para monitorar o uso das tabelas:

-- SELECT 
--   schemaname,
--   tablename,
--   heap_blks_read,
--   heap_blks_hit,
--   idx_blks_read,
--   idx_blks_hit,
--   CASE 
--     WHEN (heap_blks_read + heap_blks_hit) > 0 
--     THEN ROUND(100.0 * heap_blks_hit / (heap_blks_read + heap_blks_hit), 2) 
--   END AS heap_hit_ratio,
--   CASE 
--     WHEN (idx_blks_read + idx_blks_hit) > 0 
--     THEN ROUND(100.0 * idx_blks_hit / (idx_blks_read + idx_blks_hit), 2) 
--   END AS idx_hit_ratio
-- FROM pg_statio_user_tables
-- WHERE tablename IN ('conversations', 'conversation_participants', 'messages')
-- ORDER BY tablename;

























