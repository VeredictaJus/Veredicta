-- Script SIMPLES para corrigir duplicados
-- Execute este script no Supabase SQL Editor

-- 1. Ver o que temos na tabela
SELECT id, name, price, plan_code, created_at FROM plans ORDER BY created_at;

-- 2. Remover todos os registros duplicados, mantendo apenas o mais antigo
DELETE FROM plans 
WHERE id NOT IN (
  SELECT DISTINCT ON (plan_code) id 
  FROM plans 
  ORDER BY plan_code, created_at ASC
);

-- 3. Se a coluna plan_code não existe, adicionar
ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_code TEXT;

-- 4. Popular plan_code baseado no nome/preço
UPDATE plans 
SET plan_code = CASE 
    WHEN name ILIKE '%starter%' OR price <= 2000 THEN 'starter'
    WHEN name ILIKE '%professional%' OR price <= 5000 THEN 'professional'
    WHEN name ILIKE '%premium%' OR price > 5000 THEN 'premium'
    ELSE 'starter'
END
WHERE plan_code IS NULL;

-- 5. Tornar NOT NULL
ALTER TABLE plans ALTER COLUMN plan_code SET NOT NULL;

-- 6. Adicionar constraint UNIQUE
ALTER TABLE plans ADD CONSTRAINT IF NOT EXISTS plans_plan_code_unique UNIQUE (plan_code);

-- 7. Inserir planos padrão
INSERT INTO plans (plan_code, name, price, petitions_limit) VALUES
('starter', 'STARTER', 2000, 10),
('professional', 'PROFISSIONAL', 5000, 50),
('premium', 'PREMIUM', 10000, 999999)
ON CONFLICT (plan_code) DO NOTHING;

























