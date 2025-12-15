-- Verificar se a tabela petitions existe e tem dados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'petitions';

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'petitions' 
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_petitions FROM petitions;

-- 4. Verificar petições de um usuário específico (substitua pelo UID do usuário)
SELECT id, title, type, status, priority, created_at, client_id
FROM petitions 
WHERE client_id = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1'  -- Substitua pelo UID real
ORDER BY created_at DESC;

-- 5. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'petitions';



















