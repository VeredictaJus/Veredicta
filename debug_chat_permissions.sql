-- 🔍 Debug das Permissões de Chat (Arquivar e Excluir)
-- Este script verifica se o usuário tem as permissões necessárias para arquivar e excluir conversas

-- 1. Verificar usuário atual
SELECT 
    'Usuário atual:' as info,
    auth.uid() as user_id,
    (auth.uid())::text as user_id_text;

-- 2. Verificar conversas do usuário
SELECT 
    'Conversas do usuário:' as info,
    id,
    title,
    status,
    created_by,
    CASE 
        WHEN created_by = (auth.uid())::text THEN '✅ É o criador'
        ELSE '❌ Não é o criador'
    END as is_creator,
    created_at
FROM conversations 
WHERE created_by = (auth.uid())::text
ORDER BY created_at DESC
LIMIT 5;

-- 3. Teste de permissão para UPDATE (arquivar)
SELECT 
    'Teste UPDATE (arquivar):' as info,
    COUNT(*) as total_conversas,
    COUNT(CASE WHEN created_by = (auth.uid())::text THEN 1 END) as pode_atualizar
FROM conversations 
WHERE created_by = (auth.uid())::text;

-- 4. Teste de permissão para DELETE (excluir)
SELECT 
    'Teste DELETE (excluir):' as info,
    COUNT(*) as total_conversas,
    COUNT(CASE WHEN created_by = (auth.uid())::text THEN 1 END) as pode_excluir
FROM conversations 
WHERE created_by = (auth.uid())::text;

-- 5. Verificar políticas RLS ativas
SELECT 
    'Políticas RLS:' as info,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'conversations'
AND cmd IN ('UPDATE', 'DELETE')
ORDER BY cmd, policyname;

-- 6. Teste manual de arquivamento (SIMULAR)
SELECT 
    'Simulação de arquivamento:' as info,
    id,
    title,
    status as status_atual,
    CASE 
        WHEN created_by = (auth.uid())::text THEN '✅ PODE arquivar'
        ELSE '❌ NÃO PODE arquivar'
    END as permissao
FROM conversations 
WHERE created_by = (auth.uid())::text
AND status = 'active'
LIMIT 3;

-- 7. Teste manual de exclusão (SIMULAR)
SELECT 
    'Simulação de exclusão:' as info,
    id,
    title,
    CASE 
        WHEN created_by = (auth.uid())::text THEN '✅ PODE excluir'
        ELSE '❌ NÃO PODE excluir'
    END as permissao
FROM conversations 
WHERE created_by = (auth.uid())::text
LIMIT 3;

-- 8. Verificar se RLS está habilitado
SELECT 
    'RLS Status:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'conversations';

-- 9. Verificar dados de teste
SELECT 
    'Dados de teste:' as info,
    id,
    title,
    created_by,
    (auth.uid())::text as current_user,
    CASE 
        WHEN created_by = (auth.uid())::text THEN 'MATCH'
        ELSE 'NO MATCH'
    END as match_status
FROM conversations 
ORDER BY created_at DESC
LIMIT 3;

-- 10. Comando para testar arquivamento (descomente para executar)
-- ATENÇÃO: Substitua 'CONVERSATION_ID' pelo ID real da conversa
-- UPDATE conversations 
-- SET status = 'archived' 
-- WHERE id = 'CONVERSATION_ID' 
-- AND created_by = (auth.uid())::text
-- RETURNING id, title, status;

-- 11. Comando para testar exclusão (descomente para executar)
-- ATENÇÃO: Substitua 'CONVERSATION_ID' pelo ID real da conversa
-- DELETE FROM conversations 
-- WHERE id = 'CONVERSATION_ID' 
-- AND created_by = (auth.uid())::text
-- RETURNING id, title;
























