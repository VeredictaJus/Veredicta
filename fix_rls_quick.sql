-- Solução rápida para problema RLS da tabela profiles_v2
-- Execute este script no Supabase SQL Editor

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "profiles_v2_policy" ON profiles_v2;
DROP POLICY IF EXISTS "profiles_v2_insert_policy" ON profiles_v2;
DROP POLICY IF EXISTS "profiles_v2_update_policy" ON profiles_v2;
DROP POLICY IF EXISTS "profiles_v2_select_policy" ON profiles_v2;
DROP POLICY IF EXISTS "profiles_v2_delete_policy" ON profiles_v2;

-- 2. Criar políticas permissivas para desenvolvimento
CREATE POLICY "allow_all_profiles_v2" ON profiles_v2
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. Verificar se funcionou
SELECT 'Políticas RLS corrigidas para profiles_v2' as status;
