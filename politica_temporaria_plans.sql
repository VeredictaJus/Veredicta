-- Script para criar política temporária mais permissiva
-- Execute este script no Supabase Dashboard

-- 1. Criar política temporária que permite acesso a todos os usuários autenticados
DROP POLICY IF EXISTS "temp_allow_all_authenticated_read_plans" ON plans;

CREATE POLICY "temp_allow_all_authenticated_read_plans" ON plans
FOR SELECT 
TO authenticated
USING (true); -- Permite acesso a todos os planos para usuários autenticados

-- 2. Verificar se a política foi criada
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'plans' 
AND policyname = 'temp_allow_all_authenticated_read_plans';

-- 3. Testar query com usuário autenticado
SELECT 
  id,
  name,
  price,
  is_active,
  created_at
FROM plans 
WHERE is_active = true
ORDER BY price;

-- 4. Se funcionar, você pode remover a política temporária depois:
-- DROP POLICY IF EXISTS "temp_allow_all_authenticated_read_plans" ON plans;
