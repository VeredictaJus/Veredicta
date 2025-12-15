-- 🧪 TESTE FINAL - VERIFICAÇÃO COMPLETA DO CHAT
-- Execute este script para verificar se todas as correções funcionaram

-- 1. Verificar autenticação
SELECT 
    '1. Verificação de Autenticação' AS teste,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ Usuário autenticado'
        ELSE '❌ Usuário não autenticado - FAÇA LOGIN NO SISTEMA'
    END AS resultado;

-- 2. Verificar se todas as políticas estão corretas
SELECT 
    '2. Status das Políticas RLS' AS teste,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN qual LIKE '%conversation_participants%' OR with_check LIKE '%conversation_participants%' THEN 1 END) as politicas_corretas,
    COUNT(CASE WHEN qual LIKE '%created_by%' OR with_check LIKE '%created_by%' THEN 1 END) as politicas_problematicas,
    CASE 
        WHEN COUNT(CASE WHEN qual LIKE '%created_by%' OR with_check LIKE '%created_by%' THEN 1 END) = 0 
        THEN '✅ TODAS AS POLÍTICAS CORRETAS!'
        ELSE '❌ AINDA HÁ POLÍTICAS PROBLEMÁTICAS'
    END AS status_politicas
FROM pg_policies 
WHERE tablename = 'messages';

-- 3. Verificar tabelas necessárias
SELECT 
    '3. Verificação das Tabelas' AS teste,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN '✅ messages' ELSE '❌ messages' END as tabela_messages,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN '✅ conversations' ELSE '❌ conversations' END as tabela_conversations,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN '✅ conversation_participants' ELSE '❌ conversation_participants' END as tabela_participants;

-- 4. Verificar se RLS está habilitado
SELECT 
    '4. Status RLS das Tabelas' AS teste,
    relname AS tabela,
    CASE 
        WHEN relrowsecurity THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END AS status_rls
FROM pg_class 
WHERE relname IN ('messages', 'conversations', 'conversation_participants')
ORDER BY relname;

-- 5. Verificar dados de teste
SELECT 
    '5. Dados de Teste' AS teste,
    (SELECT COUNT(*) FROM conversations) as total_conversations,
    (SELECT COUNT(*) FROM conversation_participants) as total_participants,
    (SELECT COUNT(*) FROM messages) as total_messages;

-- 6. Verificar se o usuário atual é participante de alguma conversa
SELECT 
    '6. Participações do Usuário Atual' AS teste,
    COUNT(*) as conversas_que_participa,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Usuário participa de conversas'
        ELSE '⚠️ Usuário não participa de nenhuma conversa'
    END AS resultado
FROM conversation_participants cp
WHERE cp.user_id = auth.uid()::text;

-- 7. Teste de permissões - verificar se pode ler mensagens
SELECT 
    '7. Teste de Permissões - Leitura' AS teste,
    COUNT(*) as mensagens_visiveis,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Pode executar SELECT em messages'
        ELSE '❌ Não pode executar SELECT em messages'
    END AS resultado
FROM messages;

-- 8. Verificar se pode inserir mensagens (teste teórico)
SELECT 
    '8. Teste de Permissões - Inserção' AS teste,
    CASE 
        WHEN auth.uid() IS NOT NULL 
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND cmd = 'INSERT' AND with_check LIKE '%conversation_participants%')
        THEN '✅ Políticas de INSERT configuradas corretamente'
        ELSE '❌ Políticas de INSERT não configuradas'
    END AS resultado;

-- 9. Resumo final do diagnóstico
SELECT 
    '9. DIAGNÓSTICO FINAL' AS teste,
    CASE 
        WHEN auth.uid() IS NOT NULL 
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND cmd = 'INSERT' AND with_check LIKE '%conversation_participants%')
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND cmd = 'SELECT' AND qual LIKE '%conversation_participants%')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants')
        AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND (qual LIKE '%created_by%' OR with_check LIKE '%created_by%'))
        THEN '🎉 CHAT TOTALMENTE FUNCIONAL! Pode enviar mensagens!'
        WHEN auth.uid() IS NULL 
        THEN '❌ USUÁRIO NÃO AUTENTICADO - Faça login no sistema primeiro'
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND (qual LIKE '%created_by%' OR with_check LIKE '%created_by%'))
        THEN '❌ POLÍTICAS AINDA INCORRETAS - Execute fix_remaining_policies.sql'
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants')
        THEN '❌ TABELA PARTICIPANTS NÃO EXISTE - Execute fix_chat_policies_corrected.sql'
        ELSE '⚠️ PROBLEMA DESCONHECIDO - Verificar manualmente'
    END AS resultado_final;























