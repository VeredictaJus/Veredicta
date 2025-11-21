-- Script para habilitar Realtime nas tabelas de chat
-- Execute este script se o Realtime não estiver funcionando

-- 1. Habilitar Realtime na tabela messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 2. Habilitar Realtime na tabela conversations
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- 3. Habilitar Realtime na tabela conversation_participants
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- 4. Verificar se as tabelas foram adicionadas
SELECT 
    'Tabelas habilitadas para Realtime' AS info,
    schemaname,
    tablename,
    enabled
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversations', 'conversation_participants')
ORDER BY tablename;

-- 5. Verificar se RLS está configurado corretamente para Realtime
-- Para mensagens
SELECT 
    'Políticas RLS para messages' AS info,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- 6. Se não houver políticas, criar uma básica
-- (Descomente se necessário)
/*
CREATE POLICY "Enable realtime for messages" ON messages
FOR ALL USING (true);
*/

-- 7. Verificar status final
SELECT 
    'Status final do Realtime' AS info,
    'messages' AS tabela,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM pg_publication_tables 
            WHERE tablename = 'messages' 
            AND pubname = 'supabase_realtime'
        ) THEN '✅ Habilitado'
        ELSE '❌ Não habilitado'
    END AS status;

SELECT 
    'Status final do Realtime' AS info,
    'conversations' AS tabela,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM pg_publication_tables 
            WHERE tablename = 'conversations' 
            AND pubname = 'supabase_realtime'
        ) THEN '✅ Habilitado'
        ELSE '❌ Não habilitado'
    END AS status;

SELECT 
    'Status final do Realtime' AS info,
    'conversation_participants' AS tabela,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM pg_publication_tables 
            WHERE tablename = 'conversation_participants' 
            AND pubname = 'supabase_realtime'
        ) THEN '✅ Habilitado'
        ELSE '❌ Não habilitado'
    END AS status;
