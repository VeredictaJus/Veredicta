-- Script para verificar e corrigir políticas RLS da tabela plans
-- Execute este script no Supabase Dashboard

-- 1. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'plans';

-- 2. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'plans';

-- 3. Desabilitar RLS temporariamente para teste
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;

-- 4. Testar query sem RLS
SELECT COUNT(*) as total_plans FROM plans;
SELECT COUNT(*) as active_plans FROM plans WHERE is_active = true;

-- 5. Reabilitar RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- 6. Criar política permissiva para todos os usuários autenticados
DROP POLICY IF EXISTS "allow_everyone_read_active_plans" ON plans;
CREATE POLICY "allow_everyone_read_active_plans" ON plans
FOR SELECT 
TO authenticated
USING (is_active = true);

-- 7. Criar política para admins gerenciarem todos os planos
DROP POLICY IF EXISTS "allow_admins_manage_plans" ON plans;
CREATE POLICY "allow_admins_manage_plans" ON plans
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- 8. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'plans';

-- 9. Teste final
SELECT 
  id,
  name,
  price,
  is_active,
  created_at
FROM plans 
WHERE is_active = true
ORDER BY price;
