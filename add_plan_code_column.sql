-- Script SUPER SIMPLES - apenas adiciona a coluna que falta
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna plan_code à tabela plans existente
ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_code TEXT;

-- Atualizar registros existentes
UPDATE plans SET plan_code = 'starter' WHERE plan_code IS NULL AND (name ILIKE '%starter%' OR price <= 2000);
UPDATE plans SET plan_code = 'professional' WHERE plan_code IS NULL AND (name ILIKE '%professional%' OR price <= 5000);
UPDATE plans SET plan_code = 'premium' WHERE plan_code IS NULL AND (name ILIKE '%premium%' OR price > 5000);

-- Tornar NOT NULL após popular
ALTER TABLE plans ALTER COLUMN plan_code SET NOT NULL;

-- Adicionar constraint UNIQUE
ALTER TABLE plans ADD CONSTRAINT IF NOT EXISTS plans_plan_code_key UNIQUE (plan_code);

-- Inserir planos se não existirem
INSERT INTO plans (plan_code, name, price, petitions_limit) VALUES
('starter', 'STARTER', 2000, 10),
('professional', 'PROFISSIONAL', 5000, 50),
('premium', 'PREMIUM', 10000, 999999)
ON CONFLICT (plan_code) DO NOTHING;

























