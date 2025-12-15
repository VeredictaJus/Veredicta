-- 🔧 SCRIPT PARA CORRIGIR PROBLEMAS COM TABELA CONVERSATIONS
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela conversations existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'conversations'
);

-- 2. Verificar estrutura da tabela conversations
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_conversations FROM conversations;

-- 4. Verificar políticas RLS (Row Level Security)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'conversations';

-- 5. Se a tabela não existir ou tiver problemas, criar/corrigir
-- Descomente as linhas abaixo se necessário:

/*
-- Criar tabela conversations se não existir
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('support', 'petition', 'general')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_by VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    petition_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    last_admin_activity TIMESTAMP WITH TIME ZONE,
    response_count INTEGER DEFAULT 0
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que usuários vejam suas próprias conversas
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (created_by = auth.uid()::text);

-- Criar política para permitir que usuários criem conversas
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

-- Criar política para permitir que usuários atualizem suas próprias conversas
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (created_by = auth.uid()::text);

-- Criar política para permitir que usuários excluam suas próprias conversas
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
CREATE POLICY "Users can delete their own conversations" ON conversations
    FOR DELETE USING (created_by = auth.uid()::text);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_conversations_updated_at();
*/

-- 6. Verificar tabela messages
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'messages'
);

-- 7. Verificar estrutura da tabela messages
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 8. Verificar tabela conversation_participants
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'conversation_participants'
);

-- 9. Verificar estrutura da tabela conversation_participants
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversation_participants'
ORDER BY ordinal_position;

-- 10. Verificar se há dados de exemplo
SELECT 
    'conversations' as tabela,
    COUNT(*) as total_registros
FROM conversations
UNION ALL
SELECT 
    'messages' as tabela,
    COUNT(*) as total_registros
FROM messages
UNION ALL
SELECT 
    'conversation_participants' as tabela,
    COUNT(*) as total_registros
FROM conversation_participants;
























