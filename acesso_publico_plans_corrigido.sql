-- Script para permitir acesso público aos planos ativos
-- Execute este script no Supabase Dashboard

-- 1. Criar política para acesso público aos planos ativos
DROP POLICY IF EXISTS "allow_public_read_active_plans" ON plans;

CREATE POLICY "allow_public_read_active_plans" ON plans
FOR SELECT 
TO public
USING (is_active = true);

-- 2. Verificar se a política foi criada
SELECT 
  policyname,
  cmd,
  qual,
  roles
FROM pg_policies 
WHERE tablename = 'plans' 
AND policyname = 'allow_public_read_active_plans';

-- 3. Testar query sem autenticação
SELECT 
  id,
  name,
  price,
  is_active,
  created_at
FROM plans 
WHERE is_active = true
ORDER BY price;

-- 4. Verificar todas as políticas ativas (sem ORDER BY)
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'plans';
