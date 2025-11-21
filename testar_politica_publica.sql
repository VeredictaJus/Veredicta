-- Testar se a política pública está funcionando
-- Execute este script no Supabase Dashboard

-- 1. Testar query sem autenticação
SELECT 
  id,
  name,
  price,
  is_active,
  created_at
FROM plans 
WHERE is_active = true
ORDER BY price;

-- 2. Verificar todas as políticas ativas
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'plans';

-- 3. Contar quantos planos ativos existem
SELECT COUNT(*) as total_planos_ativos
FROM plans 
WHERE is_active = true;
