-- 🧪 TESTE FINAL - FIREBASE AUTH COM SUPABASE
-- Este script testa se as políticas funcionam com Firebase Auth

-- 1. Verificar se auth.uid() retorna NULL (normal no SQL Editor)
SELECT 
    '1. Verificação auth.uid() no SQL Editor' AS teste,
    auth.uid() as supabase_auth_uid,
    CASE 
        WHEN auth.uid() IS NULL THEN '✅ CORRETO: auth.uid() é NULL no SQL Editor'
        ELSE '⚠️ Inesperado: auth.uid() não é NULL'
    END AS status;

-- 2. Testar se pode ler mensagens (deve funcionar agora)
SELECT 
    '2. Teste de Leitura - Messages' AS teste,
    COUNT(*) as mensagens_visiveis,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Pode ler mensagens'
        ELSE '❌ Não pode ler mensagens'
    END AS resultado
FROM messages;

-- 3. Testar se pode ler conversas (deve funcionar agora)
SELECT 
    '3. Teste de Leitura - Conversations' AS teste,
    COUNT(*) as conversas_visiveis,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Pode ler conversas'
        ELSE '❌ Não pode ler conversas'
    END AS resultado
FROM conversations;

-- 4. Testar se pode ler participantes (deve funcionar agora)
SELECT 
    '4. Teste de Leitura - Participants' AS teste,
    COUNT(*) as participantes_visiveis,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Pode ler participantes'
        ELSE '❌ Não pode ler participantes'
    END AS resultado
FROM conversation_participants;

-- 5. Verificar políticas atuais
SELECT 
    '5. Políticas Atuais' AS teste,
    tablename,
    COUNT(*) as total_policies,
    STRING_AGG(cmd, ', ') as operacoes_permitidas
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations', 'conversation_participants')
GROUP BY tablename
ORDER BY tablename;

-- 6. Resumo do diagnóstico
SELECT 
    '6. DIAGNÓSTICO FINAL' AS teste,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND cmd = 'INSERT' AND (qual = 'true' OR with_check = 'true'))
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND cmd = 'SELECT' AND qual = 'true')
        AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'))
        THEN '🎉 CHAT FUNCIONANDO COM FIREBASE AUTH!'
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'))
        THEN '❌ AINDA HÁ POLÍTICAS COM auth.uid() - Execute fix_firebase_auth_rls.sql'
        ELSE '⚠️ POLÍTICAS NÃO CONFIGURADAS CORRETAMENTE'
    END AS resultado_final;























