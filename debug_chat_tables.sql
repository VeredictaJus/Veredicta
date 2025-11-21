-- Script para debugar problemas com as tabelas de chat
-- Verifica se as tabelas existem e têm dados

-- 1. Verificar se as tabelas existem
SELECT 
    'Verificação de tabelas' AS teste,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') 
        THEN '✅ Tabela conversations existe'
        ELSE '❌ Tabela conversations não encontrada'
    END AS conversations,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') 
        THEN '✅ Tabela messages existe'
        ELSE '❌ Tabela messages não encontrada'
    END AS messages,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') 
        THEN '✅ Tabela conversation_participants existe'
        ELSE '❌ Tabela conversation_participants não encontrada'
    END AS participants;

-- 2. Verificar estrutura da tabela messages
SELECT 
    'Estrutura da tabela messages' AS teste,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela conversations
SELECT 
    'Estrutura da tabela conversations' AS teste,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela conversation_participants
SELECT 
    'Estrutura da tabela conversation_participants' AS teste,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversation_participants'
ORDER BY ordinal_position;

-- 5. Verificar dados nas tabelas
SELECT 
    'Dados nas tabelas' AS teste,
    (SELECT COUNT(*) FROM conversations) AS total_conversations,
    (SELECT COUNT(*) FROM messages) AS total_messages,
    (SELECT COUNT(*) FROM conversation_participants) AS total_participants;

-- 6. Verificar conversas existentes
SELECT 
    'Conversas existentes' AS teste,
    id,
    title,
    type,
    status,
    created_by,
    created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 5;

-- 7. Verificar participantes existentes
SELECT 
    'Participantes existentes' AS teste,
    conversation_id,
    user_id,
    role,
    created_at
FROM conversation_participants
ORDER BY created_at DESC
LIMIT 10;

-- 8. Verificar mensagens existentes
SELECT 
    'Mensagens existentes' AS teste,
    id,
    conversation_id,
    sender_id,
    content,
    message_type,
    created_at
FROM messages
ORDER BY created_at DESC
LIMIT 5;

-- 9. Testar função get_user_conversations
SELECT 
    'Teste da função get_user_conversations' AS teste,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_conversations') 
        THEN '✅ Função get_user_conversations existe'
        ELSE '❌ Função get_user_conversations não encontrada'
    END AS status;

-- 10. Testar função create_conversation
SELECT 
    'Teste da função create_conversation' AS teste,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_conversation') 
        THEN '✅ Função create_conversation existe'
        ELSE '❌ Função create_conversation não encontrada'
    END AS status;
