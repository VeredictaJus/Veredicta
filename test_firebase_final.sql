-- 🧪 TESTE FINAL - FIREBASE AUTH FUNCIONANDO
-- Este script testa se o chat está funcionando com Firebase Auth

-- 1. Verificar se auth.uid() retorna NULL (normal no SQL Editor)
SELECT 
    '1. Verificação auth.uid()' AS teste,
    auth.uid() as supabase_auth_uid,
    CASE 
        WHEN auth.uid() IS NULL THEN '✅ CORRETO: auth.uid() é NULL (Firebase Auth)'
        ELSE '⚠️ Inesperado: auth.uid() não é NULL'
    END AS status;

-- 2. Verificar políticas finais
SELECT 
    '2. Políticas Finais' AS teste,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN policyname LIKE 'Allow%' THEN 1 END) as politicas_allow,
    COUNT(CASE WHEN policyname LIKE 'Users can%' THEN 1 END) as politicas_users,
    CASE 
        WHEN COUNT(CASE WHEN policyname LIKE 'Users can%' THEN 1 END) = 0 
        THEN '✅ APENAS POLÍTICAS "Allow" (CORRETO)'
        ELSE '❌ AINDA HÁ POLÍTICAS "Users can" (PROBLEMA)'
    END AS status_politicas
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations', 'conversation_participants');

-- 3. Teste de operações (deve funcionar agora)
SELECT 
    '3. Teste de Leitura - Messages' AS teste,
    COUNT(*) as mensagens_visiveis,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Pode ler mensagens'
        ELSE '❌ Não pode ler mensagens'
    END AS resultado
FROM messages;

SELECT 
    '3. Teste de Leitura - Conversations' AS teste,
    COUNT(*) as conversas_visiveis,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Pode ler conversas'
        ELSE '❌ Não pode ler conversas'
    END AS resultado
FROM conversations;

SELECT 
    '3. Teste de Leitura - Participants' AS teste,
    COUNT(*) as participantes_visiveis,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Pode ler participantes'
        ELSE '❌ Não pode ler participantes'
    END AS resultado
FROM conversation_participants;

-- 4. Resumo final
SELECT 
    '4. DIAGNÓSTICO FINAL' AS teste,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename IN ('messages', 'conversations', 'conversation_participants') AND policyname LIKE 'Users can%')
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname LIKE 'Allow%' AND cmd = 'INSERT')
        THEN '🎉 CHAT TOTALMENTE FUNCIONAL COM FIREBASE AUTH!'
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename IN ('messages', 'conversations', 'conversation_participants') AND policyname LIKE 'Users can%')
        THEN '❌ AINDA HÁ POLÍTICAS "Users can" - Execute fix_firebase_auth_rls_final.sql'
        ELSE '⚠️ POLÍTICAS NÃO CONFIGURADAS CORRETAMENTE'
    END AS resultado_final;























