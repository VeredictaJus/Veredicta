-- Script para LIMPAR e RECRIAR a tabela plans corretamente
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o que existe atualmente
SELECT * FROM plans;

-- 2. LIMPAR TUDO - remover todos os registros duplicados/incorretos
TRUNCATE TABLE plans CASCADE;

-- 3. Garantir que a coluna plan_code existe
ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_code TEXT;

-- 4. Garantir que todas as colunas necessárias existem
ALTER TABLE plans ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE plans ADD COLUMN IF NOT EXISTS api_access BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS support_level TEXT DEFAULT 'basic';

-- 5. Adicionar constraint UNIQUE se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'plans_plan_code_unique'
    ) THEN
        ALTER TABLE plans ADD CONSTRAINT plans_plan_code_unique UNIQUE (plan_code);
    END IF;
END $$;

-- 6. INSERIR OS 3 PLANOS CORRETOS (valores em centavos - R$ 20,00 = 2000 centavos)
INSERT INTO plans (plan_code, name, price, features, petitions_limit, api_access, support_level) VALUES
(
    'starter', 
    'STARTER', 
    2000,  -- R$ 20,00 em centavos
    ARRAY['Até 10 petições/mês', 'Suporte básico', 'Templates padrão'], 
    10, 
    false, 
    'basic'
),
(
    'professional', 
    'PROFISSIONAL', 
    5000,  -- R$ 50,00 em centavos
    ARRAY['Até 50 petições/mês', 'Suporte prioritário', 'API Access', 'Templates premium'], 
    50, 
    true, 
    'priority'
),
(
    'premium', 
    'PREMIUM', 
    10000,  -- R$ 100,00 em centavos
    ARRAY['Petições ilimitadas', 'Suporte dedicado', 'API completa', 'Customização'], 
    999999, 
    true, 
    'dedicated'
)
ON CONFLICT (plan_code) DO NOTHING;

-- 7. Verificar o resultado
SELECT plan_code, name, price, petitions_limit, api_access, support_level FROM plans ORDER BY price;

























