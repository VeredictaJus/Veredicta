-- 🧪 Teste das Operações de Chat (Arquivar e Excluir)
-- Este script testa se as operações de arquivar e excluir conversas estão funcionando

-- 1. Verificar dados atuais
SELECT 
    'Conversas atuais:' as info,
    COUNT(*) as total_conversations,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_conversations,
    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_conversations
FROM conversations;

-- 2. Verificar conversas do usuário logado
SELECT 
    'Conversas do usuário:' as info,
    id,
    title,
    status,
    created_by,
    (auth.uid())::text as current_user_uid,
    created_at,
    updated_at
FROM conversations 
WHERE created_by = (auth.uid())::text
ORDER BY updated_at DESC;

-- 3. Verificar mensagens das conversas do usuário
SELECT 
    'Mensagens das conversas do usuário:' as info,
    m.id as message_id,
    m.conversation_id,
    c.title as conversation_title,
    m.content,
    m.sender_id,
    m.created_at
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
WHERE c.created_by = (auth.uid())::text
ORDER BY m.created_at DESC
LIMIT 10;

-- 4. Verificar participantes das conversas do usuário
SELECT 
    'Participantes das conversas do usuário:' as info,
    cp.conversation_id,
    c.title as conversation_title,
    cp.user_id,
    cp.role,
    cp.created_at
FROM conversation_participants cp
JOIN conversations c ON c.id = cp.conversation_id
WHERE c.created_by = (auth.uid())::text
ORDER BY cp.created_at DESC
LIMIT 10;

-- 5. Teste de permissão para UPDATE (arquivar)
SELECT 
    'Teste de permissão UPDATE (arquivar):' as info,
    id,
    title,
    status,
    CASE 
        WHEN created_by = (auth.uid())::text THEN '✅ PODE ARQUIVAR'
        ELSE '❌ NÃO PODE ARQUIVAR'
    END as can_archive
FROM conversations 
WHERE created_by = (auth.uid())::text
LIMIT 5;

-- 6. Teste de permissão para DELETE (excluir)
SELECT 
    'Teste de permissão DELETE (excluir):' as info,
    id,
    title,
    CASE 
        WHEN created_by = (auth.uid())::text THEN '✅ PODE EXCLUIR'
        ELSE '❌ NÃO PODE EXCLUIR'
    END as can_delete
FROM conversations 
WHERE created_by = (auth.uid())::text
LIMIT 5;

-- 7. Verificar se existem conversas de teste para operações
SELECT 
    'Conversas disponíveis para teste:' as info,
    id,
    title,
    status,
    created_at,
    'Para arquivar: UPDATE conversations SET status = ''archived'' WHERE id = ''' || id || ''';' as archive_command,
    'Para excluir: DELETE FROM conversations WHERE id = ''' || id || ''';' as delete_command
FROM conversations 
WHERE created_by = (auth.uid())::text
AND status = 'active'
ORDER BY created_at DESC
LIMIT 3;

-- 8. Verificar políticas RLS ativas
SELECT 
    'Políticas RLS ativas:' as info,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN '✅ Usa auth.uid()'
        ELSE '❌ Não usa auth.uid()'
    END as uses_auth_uid
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
AND cmd IN ('UPDATE', 'DELETE')
ORDER BY tablename, cmd;

-- 9. Teste manual de arquivamento (descomente para testar)
-- ATENÇÃO: Descomente apenas uma linha por vez para teste
-- UPDATE conversations SET status = 'archived' WHERE id = 'ID_DA_CONVERSA' AND created_by = (auth.uid())::text;

-- 10. Teste manual de exclusão (descomente para testar)
-- ATENÇÃO: Descomente apenas uma linha por vez para teste
-- DELETE FROM conversations WHERE id = 'ID_DA_CONVERSA' AND created_by = (auth.uid())::text;
























