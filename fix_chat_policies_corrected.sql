-- 🔧 CORREÇÃO ESPECÍFICA - POLÍTICAS RLS PARA PARTICIPANTES
-- Este script corrige o problema específico identificado nas políticas atuais

-- 1. Verificar políticas atuais (para referência)
SELECT 
    'Políticas atuais (antes da correção)' AS info,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%created_by%' THEN '❌ PROBLEMA: Verifica apenas criador'
        WHEN qual LIKE '%conversation_participants%' THEN '✅ CORRETO: Verifica participantes'
        ELSE '⚠️ OUTRO: Verificar manualmente'
    END AS problema_detectado
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd;

-- 2. Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- 3. Criar políticas corretas baseadas em PARTICIPANTES, não criadores

-- Política para SELECT (ler mensagens) - baseada em participantes
CREATE POLICY "Users can view messages from conversations they participate in" ON messages
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()::text
        )
    );

-- Política para INSERT (enviar mensagens) - baseada em participantes
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

-- Política para UPDATE (atualizar mensagens) - apenas suas próprias mensagens
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

-- Política para DELETE (excluir mensagens) - apenas suas próprias mensagens
CREATE POLICY "Users can delete their own messages in conversations they participate in" ON messages
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL 
        AND sender_id = auth.uid()::text
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()::text
        )
    );

-- 4. Verificar se as políticas foram criadas corretamente
SELECT 
    'Políticas corrigidas (após a correção)' AS info,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%created_by%' THEN '❌ AINDA TEM PROBLEMA: Verifica criador'
        WHEN qual LIKE '%conversation_participants%' THEN '✅ CORRIGIDO: Verifica participantes'
        ELSE '⚠️ OUTRO: Verificar manualmente'
    END AS status_correcao
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd;

-- 5. Teste de verificação - verificar se existe a tabela conversation_participants
SELECT 
    'Verificação da tabela conversation_participants' AS info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') 
        THEN '✅ Tabela existe'
        ELSE '❌ Tabela não existe - CRIAR PRIMEIRO'
    END AS status_tabela;

-- 6. Se a tabela conversation_participants não existir, criar
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Firebase UID
    role VARCHAR(20) DEFAULT 'participant',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- 7. Habilitar RLS na tabela conversation_participants se não estiver habilitado
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas para conversation_participants
DROP POLICY IF EXISTS "Users can manage conversation participants" ON conversation_participants;

CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL 
        AND (
            user_id = auth.uid()::text 
            OR EXISTS (
                SELECT 1 FROM conversations c
                WHERE c.id = conversation_participants.conversation_id
                AND c.created_by = auth.uid()::text
            )
        )
    );

CREATE POLICY "Users can add participants to conversations they created" ON conversation_participants
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_participants.conversation_id
            AND c.created_by = auth.uid()::text
        )
    );

-- 9. Verificar se há conversas sem participantes e criar participantes padrão
-- Este passo garante que as conversas existentes tenham participantes
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
);

-- 10. Verificação final
SELECT 
    '🎉 CORREÇÃO CONCLUÍDA' AS info,
    'Políticas corrigidas para usar PARTICIPANTES ao invés de CRIADORES' AS resultado;

-- 11. Teste de verificação final
SELECT 
    'Verificação final - Políticas baseadas em participantes' AS info,
    COUNT(*) as total_policies,
    STRING_AGG(
        CASE 
            WHEN qual LIKE '%conversation_participants%' THEN '✅'
            ELSE '❌'
        END, ' '
    ) as status_participantes
FROM pg_policies 
WHERE tablename = 'messages';























