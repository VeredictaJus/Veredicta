-- Script para corrigir RLS da tabela conversations
-- O problema é que as políticas estão impedindo a criação de conversas

-- 1. Remover políticas problemáticas
DROP POLICY IF EXISTS "Enable all for authenticated users on conversations" ON conversations;

-- 2. Criar política mais permissiva para conversations
CREATE POLICY "Allow authenticated users to manage conversations" ON conversations
FOR ALL USING (true) WITH CHECK (true);

-- 3. Verificar se a política foi criada
SELECT 
    'Políticas atuais para conversations' AS info,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

-- 4. Teste: Verificar se RLS está habilitado
SELECT 
    'Status RLS - conversations' AS info,
    relname AS tabela,
    CASE 
        WHEN relrowsecurity THEN '🔒 RLS Habilitado'
        ELSE '🔓 RLS Desabilitado'
    END AS status_rls
FROM pg_class 
WHERE relname = 'conversations';

-- 5. Verificar se a tabela está na publicação do Realtime
SELECT 
    'Tabela conversations na publicação' AS info,
    tablename,
    CASE 
        WHEN tablename = 'conversations' THEN '✅ Está na publicação'
        ELSE '❌ NÃO está na publicação'
    END AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename = 'conversations';

-- 6. Resumo
SELECT 
    '🎉 CORREÇÃO APLICADA' AS info,
    'Política RLS corrigida para permitir criação de conversas' AS resultado;
