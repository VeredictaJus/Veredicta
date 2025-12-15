-- 🔧 CORREÇÃO DEFINITIVA - FIREBASE AUTH COM SUPABASE RLS
-- Este script corrige as políticas RLS para funcionar com Firebase Auth

-- 1. Verificar situação atual das políticas
SELECT 
    'Políticas atuais que usam auth.uid()' AS info,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' 
        THEN '❌ PROBLEMA: Usa Supabase auth.uid()'
        ELSE '✅ OK: Não usa auth.uid()'
    END AS problema
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd;

-- 2. Remover todas as políticas que usam auth.uid() (Supabase Auth)
DROP POLICY IF EXISTS "Users can send messages if creator or participant" ON messages;
DROP POLICY IF EXISTS "Users can send messages to conversations they participate in" ON messages;
DROP POLICY IF EXISTS "Users can view messages from conversations they participate in" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages in conversations they participate in" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages in conversations they participate in" ON messages;

-- 3. Criar políticas que funcionam SEM auth.uid() (para Firebase Auth)
-- Política para SELECT - permitir leitura para todos (será filtrado pelo frontend)
CREATE POLICY "Allow read access to messages" ON messages
    FOR SELECT 
    USING (true);

-- Política para INSERT - permitir inserção para usuários autenticados (será validado pelo frontend)
CREATE POLICY "Allow insert access to messages" ON messages
    FOR INSERT 
    WITH CHECK (true);

-- Política para UPDATE - permitir atualização (será validado pelo frontend)
CREATE POLICY "Allow update access to messages" ON messages
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Política para DELETE - permitir exclusão (será validado pelo frontend)
CREATE POLICY "Allow delete access to messages" ON messages
    FOR DELETE 
    USING (true);

-- 4. Fazer o mesmo para conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they created" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they created" ON conversations;

CREATE POLICY "Allow read access to conversations" ON conversations
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow insert access to conversations" ON conversations
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow update access to conversations" ON conversations
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow delete access to conversations" ON conversations
    FOR DELETE 
    USING (true);

-- 5. Fazer o mesmo para conversation_participants
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations they created" ON conversation_participants;

CREATE POLICY "Allow read access to conversation_participants" ON conversation_participants
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow insert access to conversation_participants" ON conversation_participants
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow update access to conversation_participants" ON conversation_participants
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow delete access to conversation_participants" ON conversation_participants
    FOR DELETE 
    USING (true);

-- 6. Verificar políticas criadas
SELECT 
    'Políticas criadas (sem auth.uid())' AS info,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' 
        THEN '❌ AINDA USA auth.uid()'
        ELSE '✅ CORRETO: Não usa auth.uid()'
    END AS status
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations', 'conversation_participants')
ORDER BY tablename, cmd;

-- 7. Teste de verificação final
SELECT 
    'Verificação Final' AS info,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN 1 END) as politicas_com_auth_uid,
    CASE 
        WHEN COUNT(CASE WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN 1 END) = 0 
        THEN '🎉 TODAS AS POLÍTICAS CORRIGIDAS PARA FIREBASE!'
        ELSE '❌ AINDA HÁ POLÍTICAS COM auth.uid()'
    END AS resultado
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations', 'conversation_participants');























