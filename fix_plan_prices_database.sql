-- Script para corrigir os valores dos planos no banco de dados
-- Os valores estão com 3 zeros extras (multiplicados por 1000)

-- 1. Verificar os valores atuais
SELECT id, name, price, petitions_included, is_active 
FROM plans 
ORDER BY price;

-- 2. Corrigir os valores dividindo por 1000
UPDATE plans 
SET price = CASE 
  WHEN name = 'Start' THEN 520
  WHEN name = 'Pro' THEN 1680  
  WHEN name = 'Elite' THEN 7000
  ELSE price
END,
updated_at = now()
WHERE name IN ('Start', 'Pro', 'Elite');

-- 3. Verificar se as correções foram aplicadas
SELECT id, name, price, petitions_included, is_active, updated_at 
FROM plans 
WHERE name IN ('Start', 'Pro', 'Elite')
ORDER BY price;

-- 4. Verificar todos os planos após correção
SELECT id, name, price, petitions_included, is_active 
FROM plans 
ORDER BY price;

























