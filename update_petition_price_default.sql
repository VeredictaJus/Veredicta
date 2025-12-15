-- Alterar valor padrão de petições para R$ 60,00
ALTER TABLE petitions 
  ALTER COLUMN price SET DEFAULT 60.00;

-- Atualizar petições existentes que têm price = 0 para 60.00
UPDATE petitions 
SET price = 60.00 
WHERE price = 0 OR price IS NULL;

-- Verificar
SELECT id, title, price 
FROM petitions 
ORDER BY created_at DESC 
LIMIT 10;









