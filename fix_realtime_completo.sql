-- ========================================
-- SCRIPT COMPLETO: FIX REALTIME CHAT
-- ========================================
-- Execute este script no SQL Editor do Supabase
-- Ele verifica e corrige tudo relacionado ao Realtime

-- ========================================
-- 1. VERIFICAR STATUS ATUAL
-- ========================================
SELECT 
    '🔍 VERIFICAÇÃO INICIAL' AS etapa,
    tablename AS tabela,
    CASE 
        WHEN tablename IS NOT NULL THEN '✅ Já na publicação'
        ELSE '❌ Não está na publicação'
    END AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversation_participants', 'conversations')
ORDER BY tablename;

-- ========================================
-- 2. ADICIONAR TABELAS À PUBLICAÇÃO
-- ========================================
-- Messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public'
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
        RAISE NOTICE '✅ Tabela public.messages adicionada à publicação';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela public.messages já está na publicação';
    END IF;
END $$;

-- Conversation Participants
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public'
        AND tablename = 'conversation_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
        RAISE NOTICE '✅ Tabela public.conversation_participants adicionada à publicação';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela public.conversation_participants já está na publicação';
    END IF;
END $$;

-- Conversations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public'
        AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
        RAISE NOTICE '✅ Tabela public.conversations adicionada à publicação';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela public.conversations já está na publicação';
    END IF;
END $$;

-- App tables (se existirem)
DO $$
BEGIN
    -- app_d379dcb283_messages
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_d379dcb283_messages') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND schemaname = 'public'
            AND tablename = 'app_d379dcb283_messages'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.app_d379dcb283_messages;
            RAISE NOTICE '✅ Tabela public.app_d379dcb283_messages adicionada à publicação';
        ELSE
            RAISE NOTICE 'ℹ️ Tabela public.app_d379dcb283_messages já está na publicação';
        END IF;
    END IF;

    -- app_d379dcb283_conversations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_d379dcb283_conversations') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND schemaname = 'public'
            AND tablename = 'app_d379dcb283_conversations'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.app_d379dcb283_conversations;
            RAISE NOTICE '✅ Tabela public.app_d379dcb283_conversations adicionada à publicação';
        ELSE
            RAISE NOTICE 'ℹ️ Tabela public.app_d379dcb283_conversations já está na publicação';
        END IF;
    END IF;
END $$;

-- ========================================
-- 3. VERIFICAR/CRIAR POLICIES RLS
-- ========================================
-- Habilitar RLS nas tabelas
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;

-- Policies para messages
DROP POLICY IF EXISTS "anon can select messages" ON public.messages;
DROP POLICY IF EXISTS "anon can insert messages" ON public.messages;

-- Policies para conversation_participants
DROP POLICY IF EXISTS "anon can select participants" ON public.conversation_participants;

CREATE POLICY "anon can select participants"
ON public.conversation_participants
FOR SELECT
TO anon
USING (true);

-- Policies para conversations
DROP POLICY IF EXISTS "anon can select conversations" ON public.conversations;

CREATE POLICY "anon can select conversations"
ON public.conversations
FOR SELECT
TO anon
USING (true);

-- ========================================
-- 4. VERIFICAÇÃO FINAL
-- ========================================
SELECT 
    '✅ VERIFICAÇÃO FINAL' AS etapa,
    schemaname || '.' || tablename AS tabela,
    'Habilitada para Realtime' AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversation_participants', 'conversations', 'app_d379dcb283_messages', 'app_d379dcb283_conversations')
ORDER BY tablename;

-- Verificar policies criadas
SELECT 
    '📋 POLICIES RLS' AS etapa,
    schemaname || '.' || tablename AS tabela,
    policyname AS policy,
    cmd AS comando
FROM pg_policies 
WHERE tablename IN ('messages', 'conversation_participants', 'conversations')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- 5. RESUMO FINAL
-- ========================================
SELECT 
    '🎉 CONFIGURAÇÃO CONCLUÍDA' AS status,
    'Realtime está configurado para as tabelas de chat' AS mensagem,
    NOW() AS configurado_em;


