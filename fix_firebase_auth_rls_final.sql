-- 🔧 CORREÇÃO DEFINITIVA - REMOVER TODAS AS POLÍTICAS COM auth.uid()
-- Este script remove TODAS as políticas que ainda usam auth.uid()

-- 1. Remover TODAS as políticas problemáticas que usam auth.uid()

-- Tabela: conversation_participants
DROP POLICY IF EXISTS "Users can delete participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update participants in their conversations" ON conversation_participants;

-- Tabela: conversations
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;

-- Tabela: messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;

-- 2. Verificar se ainda há políticas com auth.uid()
SELECT 
    'Verificação após remoção' AS info,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN 1 END) as politicas_com_auth_uid,
    CASE 
        WHEN COUNT(CASE WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN 1 END) = 0 
        THEN '🎉 TODAS AS POLÍTICAS CORRIGIDAS!'
        ELSE '❌ AINDA HÁ POLÍTICAS COM auth.uid()'
    END AS resultado
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations', 'conversation_participants');

-- 3. Listar políticas restantes (deve mostrar apenas as "Allow...")
SELECT 
    'Políticas restantes' AS info,
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
ORDER BY tablename, cmd, policyname;























