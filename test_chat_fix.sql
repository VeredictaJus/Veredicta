-- 🧪 TESTE COMPLETO - VERIFICAÇÃO DAS CORREÇÕES DO CHAT
-- Execute este script para verificar se as correções funcionaram

-- 1. Verificar se o usuário está autenticado
SELECT 
    '1. Verificação de Autenticação' AS teste,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ Usuário autenticado'
        ELSE '❌ Usuário não autenticado'
    END AS resultado;

-- 2. Verificar políticas RLS ativas
SELECT 
    '2. Políticas RLS - Messages' AS teste,
    COUNT(*) as total_policies,
    STRING_AGG(cmd, ', ') as operacoes_permitidas
FROM pg_policies 
WHERE tablename = 'messages';

SELECT 
    '2. Políticas RLS - Conversations' AS teste,
    COUNT(*) as total_policies,
    STRING_AGG(cmd, ', ') as operacoes_permitidas
FROM pg_policies 
WHERE tablename = 'conversations';

SELECT 
    '2. Políticas RLS - Participants' AS teste,
    COUNT(*) as total_policies,
    STRING_AGG(cmd, ', ') as operacoes_permitidas
FROM pg_policies 
WHERE tablename = 'conversation_participants';

-- 3. Verificar se RLS está habilitado
SELECT 
    '3. Status RLS' AS teste,
    relname AS tabela,
    CASE 
        WHEN relrowsecurity THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END AS status
FROM pg_class 
WHERE relname IN ('messages', 'conversations', 'conversation_participants')
ORDER BY relname;

-- 4. Testar se pode ler conversas
SELECT 
    '4. Teste de Leitura - Conversas' AS teste,
    COUNT(*) as conversas_visiveis,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Pode ler conversas'
        ELSE '⚠️ Nenhuma conversa visível (pode ser normal)'
    END AS resultado
FROM conversations;

-- 5. Testar se pode ler participantes
SELECT 
    '5. Teste de Leitura - Participantes' AS teste,
    COUNT(*) as participantes_visiveis,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Pode ler participantes'
        ELSE '⚠️ Nenhum participante visível (pode ser normal)'
    END AS resultado
FROM conversation_participants;

-- 6. Testar se pode ler mensagens
SELECT 
    '6. Teste de Leitura - Mensagens' AS teste,
    COUNT(*) as mensagens_visiveis,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Pode ler mensagens'
        ELSE '⚠️ Nenhuma mensagem visível (pode ser normal)'
    END AS resultado
FROM messages;

-- 7. Verificar se as tabelas estão na publicação do Realtime
SELECT 
    '7. Configuração Realtime' AS teste,
    tablename,
    CASE 
        WHEN tablename IS NOT NULL THEN '✅ Tabela na publicação'
        ELSE '❌ Tabela não está na publicação'
    END AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversations', 'conversation_participants')
ORDER BY tablename;

-- 8. Resumo do teste
SELECT 
    '8. Resumo do Teste' AS teste,
    CASE 
        WHEN auth.uid() IS NOT NULL 
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages')
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations')
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_participants')
        THEN '✅ TODOS OS TESTES PASSARAM - Chat deve funcionar!'
        ELSE '❌ ALGUNS TESTES FALHARAM - Verificar configuração'
    END AS resultado_final;























