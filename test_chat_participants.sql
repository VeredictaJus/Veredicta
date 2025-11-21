-- 🧪 TESTE ESPECÍFICO - VERIFICAR SE AS POLÍTICAS DE PARTICIPANTES FUNCIONAM
-- Execute este script após aplicar a correção para verificar se o problema foi resolvido

-- 1. Verificar se o usuário está autenticado
SELECT 
    '1. Verificação de Autenticação' AS teste,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ Usuário autenticado'
        ELSE '❌ Usuário não autenticado - FAÇA LOGIN NO SISTEMA'
    END AS resultado;

-- 2. Verificar se a tabela conversation_participants existe e tem dados
SELECT 
    '2. Verificação da tabela conversation_participants' AS teste,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') 
        THEN '✅ Tabela existe'
        ELSE '❌ Tabela não existe'
    END AS status_tabela;

SELECT 
    '2.1. Total de participantes' AS teste,
    COUNT(*) as total_participants
FROM conversation_participants;

-- 3. Verificar políticas atuais para messages
SELECT 
    '3. Políticas atuais para messages' AS teste,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%conversation_participants%' THEN '✅ CORRETO: Baseada em participantes'
        WHEN qual LIKE '%created_by%' THEN '❌ PROBLEMA: Baseada em criadores'
        ELSE '⚠️ OUTRO: Verificar manualmente'
    END AS tipo_politica
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd;

-- 4. Verificar se existem conversas
SELECT 
    '4. Total de conversas' AS teste,
    COUNT(*) as total_conversations
FROM conversations;

-- 5. Verificar se existem participantes para as conversas
SELECT 
    '5. Participantes por conversa' AS teste,
    c.id as conversation_id,
    c.title as conversation_title,
    c.created_by as creator_id,
    COUNT(cp.user_id) as total_participants,
    STRING_AGG(cp.user_id, ', ') as participant_ids
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
GROUP BY c.id, c.title, c.created_by
ORDER BY c.created_at DESC;

-- 6. Teste de permissões - verificar se pode ler mensagens
SELECT 
    '6. Teste de permissões - Leitura de mensagens' AS teste,
    COUNT(*) as mensagens_visiveis,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Pode executar SELECT em messages'
        ELSE '❌ Não pode executar SELECT em messages'
    END AS resultado
FROM messages;

-- 7. Verificar se o usuário atual é participante de alguma conversa
SELECT 
    '7. Participações do usuário atual' AS teste,
    COUNT(*) as conversas_que_participa,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Usuário participa de conversas'
        ELSE '⚠️ Usuário não participa de nenhuma conversa'
    END AS resultado
FROM conversation_participants cp
WHERE cp.user_id = auth.uid()::text;

-- 8. Verificar se existem mensagens nas conversas do usuário
SELECT 
    '8. Mensagens nas conversas do usuário' AS teste,
    COUNT(m.id) as total_mensagens,
    CASE 
        WHEN COUNT(m.id) > 0 THEN '✅ Existem mensagens'
        ELSE '⚠️ Nenhuma mensagem encontrada'
    END AS resultado
FROM messages m
WHERE EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = m.conversation_id
    AND cp.user_id = auth.uid()::text
);

-- 9. Resumo do diagnóstico
SELECT 
    '9. Resumo do Diagnóstico' AS teste,
    CASE 
        WHEN auth.uid() IS NOT NULL 
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND qual LIKE '%conversation_participants%')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants')
        THEN '✅ TUDO CORRETO - Chat deve funcionar!'
        WHEN auth.uid() IS NULL 
        THEN '❌ USUÁRIO NÃO AUTENTICADO - Faça login no sistema'
        WHEN NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND qual LIKE '%conversation_participants%')
        THEN '❌ POLÍTICAS INCORRETAS - Execute o script de correção'
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants')
        THEN '❌ TABELA PARTICIPANTS NÃO EXISTE - Execute o script de correção'
        ELSE '⚠️ PROBLEMA DESCONHECIDO - Verificar manualmente'
    END AS resultado_final;























