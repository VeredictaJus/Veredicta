-- CORRIGIR FUNÇÃO get_conversation_messages_v2 - COMPARAÇÃO DE TIPOS
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar estrutura da tabela message_read_status
SELECT '=== ESTRUTURA message_read_status ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'message_read_status'
ORDER BY ordinal_position;

-- 2. Corrigir função get_conversation_messages_v2
CREATE OR REPLACE FUNCTION get_conversation_messages_v2(p_conversation_id TEXT)
RETURNS TABLE (
    id TEXT,
    conversation_id TEXT,
    sender_id TEXT,
    content TEXT,
    attachment_url TEXT,
    file_name VARCHAR,
    file_size BIGINT,
    sent_at TIMESTAMP WITH TIME ZONE,
    message_type VARCHAR,
    reply_to_message_id TEXT,
    is_read BOOLEAN
) AS $$
DECLARE
    conv_uuid UUID;
BEGIN
    -- Converter conversation_id para UUID se possível
    BEGIN
        conv_uuid := p_conversation_id::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'ID de conversa inválido: %', p_conversation_id;
    END;
    
    RETURN QUERY
    SELECT 
        m.id::TEXT,
        m.conversation_id::TEXT,
        m.sender_id::TEXT,
        m.content,
        m.attachment_url,
        m.file_name,
        m.file_size,
        m.sent_at,
        m.message_type,
        NULL::TEXT as reply_to_message_id,
        EXISTS (
            SELECT 1 FROM message_read_status mrs
            WHERE mrs.message_id = m.id
            AND mrs.reader_id = auth.uid()::TEXT  -- 🔥 CONVERSÃO EXPLÍCITA UUID → TEXT
        ) AS is_read
    FROM messages m
    WHERE m.conversation_id = conv_uuid
    ORDER BY m.sent_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Testar a função corrigida
SELECT '=== TESTANDO FUNÇÃO CORRIGIDA ===' as info;
SELECT * FROM get_conversation_messages_v2('550e8400-e29b-41d4-a716-446655440000');

-- 4. Verificar se há mensagens na conversa de suporte
SELECT '=== MENSAGENS NA CONVERSA DE SUPORTE ===' as info;
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    sent_at,
    created_at
FROM messages
WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY COALESCE(sent_at, created_at) ASC;

-- 5. Testar envio de mensagem
SELECT '=== TESTANDO ENVIO DE MENSAGEM ===' as info;
SELECT send_message_v2(
    '550e8400-e29b-41d4-a716-446655440000',
    'test-firebase-uid-diagnostic',
    'Mensagem de teste após correção de tipos',
    'text',
    NULL,
    NULL,
    NULL,
    NULL
) as new_message_id;

-- 6. Verificar se a mensagem foi inserida
SELECT '=== VERIFICAR MENSAGEM DE TESTE ===' as info;
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    sent_at
FROM messages
WHERE content = 'Mensagem de teste após correção de tipos'
ORDER BY sent_at DESC
LIMIT 1;

-- 7. Testar carregamento novamente
SELECT '=== TESTAR CARREGAMENTO APÓS ENVIO ===' as info;
SELECT * FROM get_conversation_messages_v2('550e8400-e29b-41d4-a716-446655440000');

SELECT '=== CORREÇÃO COMPLETA! ===' as status;


















