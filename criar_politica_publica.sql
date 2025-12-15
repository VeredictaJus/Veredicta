-- Script simples para permitir acesso público aos planos
-- Execute este script no Supabase Dashboard

-- Criar política para acesso público aos planos ativos
CREATE POLICY "allow_public_read_active_plans" ON plans
FOR SELECT 
TO public
USING (is_active = true);

-- Testar se funcionou
SELECT 
  id,
  name,
  price,
  is_active
FROM plans 
WHERE is_active = true
ORDER BY price;
