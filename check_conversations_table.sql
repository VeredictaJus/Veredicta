-- VERIFICAR ESTRUTURA DA TABELA CONVERSATIONS
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar colunas existentes na tabela conversations
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- 2. Verificar dados de exemplo
SELECT * FROM conversations LIMIT 3;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_conversations FROM conversations;
























