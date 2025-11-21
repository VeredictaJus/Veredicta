-- 🔧 CORREÇÃO FINAL - POLÍTICAS RESTANTES
-- Este script corrige as 3 políticas que ainda estão incorretas

-- 1. Verificar quais políticas ainda estão problemáticas
SELECT 
    'Políticas que ainda precisam ser corrigidas' AS info,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%created_by%' THEN '❌ PROBLEMA: Verifica apenas criador'
        WHEN qual LIKE '%conversation_participants%' THEN '✅ CORRETO: Verifica participantes'
        ELSE '⚠️ OUTRO: Verificar manualmente'
    END AS status
FROM pg_policies 
WHERE tablename = 'messages'
AND (qual LIKE '%created_by%' OR with_check LIKE '%created_by%')
ORDER BY cmd;

-- 2. Remover as políticas problemáticas restantes
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- 3. Verificar se ainda existem políticas problemáticas
SELECT 
    'Verificação após remoção' AS info,
    COUNT(*) as total_policies_problematicas
FROM pg_policies 
WHERE tablename = 'messages'
AND (qual LIKE '%created_by%' OR with_check LIKE '%created_by%');

-- 4. Criar as políticas corretas que estavam faltando

-- Política para INSERT (enviar mensagens) - CORRIGIDA
CREATE POLICY "Users can send messages to conversations they participate in" ON messages
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND sender_id = auth.uid()::text
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()::text
        )
    );

-- Política para UPDATE (atualizar mensagens) - CORRIGIDA
CREATE POLICY "Users can update their own messages in conversations they participate in" ON messages
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL 
        AND sender_id = auth.uid()::text
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()::text
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND sender_id = auth.uid()::text
    );

-- 5. Verificação final - todas as políticas devem estar corretas agora
SELECT 
    'Verificação final - Todas as políticas corrigidas' AS info,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%created_by%' OR with_check LIKE '%created_by%' THEN '❌ AINDA TEM PROBLEMA'
        WHEN qual LIKE '%conversation_participants%' OR with_check LIKE '%conversation_participants%' THEN '✅ CORRETO'
        ELSE '⚠️ OUTRO'
    END AS status_final
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd, policyname;

-- 6. Contagem final
SELECT 
    'Resumo final' AS info,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN qual LIKE '%conversation_participants%' OR with_check LIKE '%conversation_participants%' THEN 1 END) as politicas_corretas,
    COUNT(CASE WHEN qual LIKE '%created_by%' OR with_check LIKE '%created_by%' THEN 1 END) as politicas_problematicas,
    CASE 
        WHEN COUNT(CASE WHEN qual LIKE '%created_by%' OR with_check LIKE '%created_by%' THEN 1 END) = 0 
        THEN '🎉 TODAS AS POLÍTICAS CORRIGIDAS!'
        ELSE '⚠️ AINDA HÁ POLÍTICAS PROBLEMÁTICAS'
    END AS resultado_final
FROM pg_policies 
WHERE tablename = 'messages';























