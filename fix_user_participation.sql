-- 🔧 CORREÇÃO ESPECÍFICA - PARTICIPAÇÃO DO USUÁRIO
-- Este script garante que todos os usuários sejam participantes das conversas

-- 1. Verificar situação atual
SELECT 
    'Situação Atual - Conversas sem participantes' AS info,
    COUNT(*) as conversas_sem_participantes
FROM conversations c
WHERE NOT EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = c.id
);

-- 2. Adicionar criadores como participantes (se não estiverem)
INSERT INTO conversation_participants (conversation_id, user_id, role)
SELECT DISTINCT
    c.id as conversation_id,
    c.created_by as user_id,
    'creator' as role
FROM conversations c
WHERE NOT EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = c.id 
    AND cp.user_id = c.created_by
)
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- 3. Verificar se ainda há conversas sem participantes
SELECT 
    'Após correção - Conversas sem participantes' AS info,
    COUNT(*) as conversas_sem_participantes
FROM conversations c
WHERE NOT EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = c.id
);

-- 4. Criar política mais permissiva temporariamente para teste
-- (Vamos criar uma política que permite inserção se o usuário for criador OU participante)
DROP POLICY IF EXISTS "Users can send messages to conversations they participate in" ON messages;

CREATE POLICY "Users can send messages if creator or participant" ON messages
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND sender_id = auth.uid()::text
        AND (
            -- Usuário é participante da conversa
            EXISTS (
                SELECT 1 FROM conversation_participants cp
                WHERE cp.conversation_id = messages.conversation_id
                AND cp.user_id = auth.uid()::text
            )
            OR
            -- Usuário é criador da conversa (fallback)
            EXISTS (
                SELECT 1 FROM conversations c
                WHERE c.id = messages.conversation_id
                AND c.created_by = auth.uid()::text
            )
        )
    );

-- 5. Verificar políticas criadas
SELECT 
    'Políticas atuais para INSERT' AS info,
    policyname,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename = 'messages' 
AND cmd = 'INSERT';

-- 6. Teste de verificação final
SELECT 
    'Verificação Final' AS info,
    COUNT(*) as total_conversas,
    COUNT(CASE WHEN EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = c.id) THEN 1 END) as conversas_com_participantes,
    COUNT(CASE WHEN NOT EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = c.id) THEN 1 END) as conversas_sem_participantes
FROM conversations c;























