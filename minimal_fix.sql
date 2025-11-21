-- Script MÍNIMO - funciona com qualquer estrutura existente
-- Execute este script no Supabase SQL Editor

-- Verificar se a coluna plan_code existe, se não, adicionar
DO $$ 
BEGIN
    -- Adicionar coluna se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plans' AND column_name = 'plan_code'
    ) THEN
        ALTER TABLE plans ADD COLUMN plan_code TEXT;
        
        -- Popular com valores baseados no nome ou preço
        UPDATE plans SET plan_code = 'starter' WHERE name ILIKE '%starter%' OR price <= 2000;
        UPDATE plans SET plan_code = 'professional' WHERE name ILIKE '%professional%' OR price <= 5000;
        UPDATE plans SET plan_code = 'premium' WHERE name ILIKE '%premium%' OR price > 5000;
        
        -- Definir valores padrão para registros restantes
        UPDATE plans SET plan_code = 'starter' WHERE plan_code IS NULL;
        
        -- Tornar NOT NULL
        ALTER TABLE plans ALTER COLUMN plan_code SET NOT NULL;
        
        -- Adicionar constraint UNIQUE
        ALTER TABLE plans ADD CONSTRAINT plans_plan_code_unique UNIQUE (plan_code);
    END IF;
END $$;

-- Inserir planos padrão se não existirem
INSERT INTO plans (plan_code, name, price, petitions_limit) VALUES
('starter', 'STARTER', 2000, 10),
('professional', 'PROFISSIONAL', 5000, 50),
('premium', 'PREMIUM', 10000, 999999)
ON CONFLICT (plan_code) DO NOTHING;

























