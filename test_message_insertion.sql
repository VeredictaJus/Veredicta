-- 🧪 TESTE ESPECÍFICO - INSERÇÃO DE MENSAGENS
-- Este script testa se é possível inserir mensagens com o usuário atual

-- 1. Verificar autenticação
SELECT 
    '1. Autenticação' AS teste,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ Usuário autenticado'
        ELSE '❌ Usuário não autenticado'
    END AS status;

-- 2. Verificar conversas disponíveis para o usuário
SELECT 
    '2. Conversas Disponíveis' AS teste,
    c.id as conversation_id,
    c.title,
    c.created_by,
    CASE 
        WHEN EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = c.id AND cp.user_id = auth.uid()::text) 
        THEN '✅ É participante'
        WHEN c.created_by = auth.uid()::text 
        THEN '✅ É criador'
        ELSE '❌ Não tem acesso'
    END AS acesso
FROM conversations c
ORDER BY c.created_at DESC;

-- 3. Teste de inserção de mensagem (simulação)
-- Vamos testar se a política permite inserção
SELECT 
    '3. Teste de Política INSERT' AS teste,
    CASE 
        WHEN auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE (
                -- Usuário é participante
                EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = c.id AND cp.user_id = auth.uid()::text)
                OR
                -- Usuário é criador
                c.created_by = auth.uid()::text
            )
        )
        THEN '✅ Política permite inserção'
        ELSE '❌ Política bloqueia inserção'
    END AS resultado;

-- 4. Verificar se há pelo menos uma conversa acessível
SELECT 
    '4. Conversas Acessíveis' AS teste,
    COUNT(*) as total_conversas_acessiveis,
    STRING_AGG(c.title, ', ') as titulos_conversas
FROM conversations c
WHERE (
    EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = c.id AND cp.user_id = auth.uid()::text)
    OR
    c.created_by = auth.uid()::text
);

-- 5. Resumo do diagnóstico
SELECT 
    '5. Diagnóstico Final' AS teste,
    CASE 
        WHEN auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE (
                EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = c.id AND cp.user_id = auth.uid()::text)
                OR
                c.created_by = auth.uid()::text
            )
        )
        THEN '🎉 USUÁRIO PODE ENVIAR MENSAGENS!'
        WHEN auth.uid() IS NULL 
        THEN '❌ USUÁRIO NÃO AUTENTICADO'
        ELSE '❌ USUÁRIO NÃO TEM ACESSO A NENHUMA CONVERSA'
    END AS resultado_final;























