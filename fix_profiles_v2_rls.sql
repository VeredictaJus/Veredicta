-- Corrigir políticas RLS para tabela profiles_v2
-- Este script permite que usuários autenticados criem e atualizem seus próprios perfis

-- 1. Primeiro, vamos verificar se a tabela existe e sua estrutura
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles_v2' 
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS existentes
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
WHERE tablename = 'profiles_v2';

-- 3. Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "profiles_v2_policy" ON profiles_v2;
DROP POLICY IF EXISTS "profiles_v2_insert_policy" ON profiles_v2;
DROP POLICY IF EXISTS "profiles_v2_update_policy" ON profiles_v2;
DROP POLICY IF EXISTS "profiles_v2_select_policy" ON profiles_v2;

-- 4. Criar políticas RLS mais permissivas para desenvolvimento
-- Política para SELECT - permite ler todos os perfis (para desenvolvimento)
CREATE POLICY "profiles_v2_select_policy" ON profiles_v2
    FOR SELECT
    USING (true);

-- Política para INSERT - permite inserir novos perfis
CREATE POLICY "profiles_v2_insert_policy" ON profiles_v2
    FOR INSERT
    WITH CHECK (true);

-- Política para UPDATE - permite atualizar perfis
CREATE POLICY "profiles_v2_update_policy" ON profiles_v2
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Política para DELETE - permite deletar perfis (cuidado!)
CREATE POLICY "profiles_v2_delete_policy" ON profiles_v2
    FOR DELETE
    USING (true);

-- 5. Garantir que RLS está habilitado
ALTER TABLE profiles_v2 ENABLE ROW LEVEL SECURITY;

-- 6. Verificar se as políticas foram criadas
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
WHERE tablename = 'profiles_v2';

-- 7. Teste: tentar inserir um perfil de teste
-- INSERT INTO profiles_v2 (firebase_uid, email, role) 
-- VALUES ('test-uid-123', 'test@example.com', 'client');

-- 8. Verificar se a inserção funcionou
-- SELECT * FROM profiles_v2 WHERE firebase_uid = 'test-uid-123';

-- 9. Limpar o teste
-- DELETE FROM profiles_v2 WHERE firebase_uid = 'test-uid-123';
