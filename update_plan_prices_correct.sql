-- Script para atualizar os valores corretos dos planos
-- Valores corretos: Start R$ 520, Pro R$ 1680, Elite R$ 7000

-- Verificar os planos atuais
SELECT id, name, price, petitions_included, is_active FROM plans ORDER BY price;

-- Atualizar os valores dos planos
UPDATE plans 
SET price = CASE 
  WHEN name = 'Start' THEN 520
  WHEN name = 'Pro' THEN 1680  
  WHEN name = 'Elite' THEN 7000
  ELSE price
END,
updated_at = now()
WHERE name IN ('Start', 'Pro', 'Elite');

-- Verificar se as atualizações foram aplicadas
SELECT id, name, price, petitions_included, is_active, updated_at 
FROM plans 
WHERE name IN ('Start', 'Pro', 'Elite')
ORDER BY price;

-- Verificar todos os planos após atualização
SELECT id, name, price, petitions_included, is_active FROM plans ORDER BY price;

























