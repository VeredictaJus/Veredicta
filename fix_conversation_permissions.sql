-- CORREÇÃO DAS PERMISSÕES PARA EXCLUSÃO DE CONVERSAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Primeiro, vamos verificar as políticas atuais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename, policyname;

-- 2. Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;

-- 3. Criar política correta para exclusão de conversas
-- Permitir que usuários excluam conversas que eles criaram
CREATE POLICY "Users can delete conversations they created" ON conversations
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()
    );

-- 4. Política alternativa: Permitir exclusão se o usuário é participante da conversa
-- (Comentado por enquanto, mas pode ser útil)
-- CREATE POLICY "Users can delete conversations they participate in" ON conversations
--     FOR DELETE
--     USING (
--         auth.uid() IS NOT NULL 
--         AND EXISTS (
--             SELECT 1 FROM conversation_participants cp
--             WHERE cp.conversation_id = conversations.id
--             AND cp.user_id = auth.uid()
--         )
--     );

-- 5. Verificar se RLS está habilitado
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 6. Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

-- 7. Testar a política (opcional - apenas para verificar)
-- SELECT 
--     id,
--     title,
--     created_by,
--     auth.uid() as current_user_id,
--     (created_by = auth.uid()) as can_delete
-- FROM conversations
-- WHERE auth.uid() IS NOT NULL;
























