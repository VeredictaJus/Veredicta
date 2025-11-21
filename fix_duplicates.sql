-- Script para corrigir duplicados na tabela plans
-- Execute este script no Supabase SQL Editor

-- 1. Verificar duplicados primeiro
SELECT plan_code, COUNT(*) as count 
FROM plans 
GROUP BY plan_code 
HAVING COUNT(*) > 1;

-- 2. Remover duplicados, mantendo apenas o mais recente
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY plan_code ORDER BY created_at DESC) as rn
  FROM plans
  WHERE plan_code IS NOT NULL
)
DELETE FROM plans 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Se ainda houver registros sem plan_code, definir valores únicos
UPDATE plans 
SET plan_code = CASE 
    WHEN name ILIKE '%starter%' OR price <= 2000 THEN 'starter'
    WHEN name ILIKE '%professional%' OR price <= 5000 THEN 'professional' 
    WHEN name ILIKE '%premium%' OR price > 5000 THEN 'premium'
    ELSE 'starter'
END
WHERE plan_code IS NULL;

-- 4. Se ainda houver duplicados, adicionar sufixo numérico
WITH numbered_duplicates AS (
  SELECT id, plan_code,
         ROW_NUMBER() OVER (PARTITION BY plan_code ORDER BY created_at) as rn
  FROM plans
  WHERE plan_code IN (
    SELECT plan_code FROM plans 
    GROUP BY plan_code 
    HAVING COUNT(*) > 1
  )
)
UPDATE plans 
SET plan_code = CASE 
    WHEN rn > 1 THEN plan_code || '_' || rn
    ELSE plan_code
END
FROM numbered_duplicates 
WHERE plans.id = numbered_duplicates.id AND numbered_duplicates.rn > 1;

-- 5. Agora adicionar a constraint UNIQUE
ALTER TABLE plans ADD CONSTRAINT IF NOT EXISTS plans_plan_code_unique UNIQUE (plan_code);

-- 6. Inserir planos padrão se não existirem
INSERT INTO plans (plan_code, name, price, petitions_limit) VALUES
('starter', 'STARTER', 2000, 10),
('professional', 'PROFISSIONAL', 5000, 50),
('premium', 'PREMIUM', 10000, 999999)
ON CONFLICT (plan_code) DO NOTHING;

























