-- Script COMPLETO: Adiciona colunas + Insere planos corretos
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar TODAS as colunas necessárias
ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_code TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE plans ADD COLUMN IF NOT EXISTS petitions_limit INTEGER DEFAULT 50;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS api_access BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS support_level TEXT DEFAULT 'basic';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Limpar dados existentes
TRUNCATE TABLE plans CASCADE;

-- 3. Adicionar constraint UNIQUE se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'plans_plan_code_unique'
    ) THEN
        ALTER TABLE plans ADD CONSTRAINT plans_plan_code_unique UNIQUE (plan_code);
    END IF;
END $$;

-- 4. INSERIR OS 4 PLANOS CORRETOS da plataforma Veredicta
INSERT INTO plans (plan_code, name, price, features, petitions_limit, api_access, support_level) VALUES
(
    'free', 
    'Free', 
    0,  -- Gratuito
    ARRAY[
        '1 petição gratuita',
        'Entrega em 3-5 dias úteis', 
        '1 revisão gratuita',
        'Consulta com redator e chat incluso',
        'Validade: 7 dias',
        'Confidencialidade garantida (NDA)'
    ], 
    1, 
    false, 
    'basic'
),
(
    'start', 
    'Start', 
    52000,  -- R$ 520,00 em centavos
    ARRAY[
        '4 petições incluídas',
        'Até 3 dias úteis por entrega',
        '1 revisão gratuita no pacote',
        'Consulta com redator e chat incluso',
        'Validade: 30 dias',
        'Confidencialidade garantida (NDA)'
    ], 
    4, 
    false, 
    'basic'
),
(
    'pro', 
    'Pro', 
    168000,  -- R$ 1.680,00 em centavos
    ARRAY[
        '14 petições incluídas',
        'Entregas em até 2 dias úteis',
        '1 revisão gratuita por petição',
        'Consulta com redator e chat incluso',
        '+1 petição bônus na renovação',
        'Validade: 60 dias',
        'Confidencialidade garantida (NDA)'
    ], 
    14, 
    true, 
    'priority'
),
(
    'elite', 
    'Elite', 
    700000,  -- R$ 7.000,00 em centavos
    ARRAY[
        '70 petições incluídas',
        'Entrega em até 1 dia útil (prioridade máxima)',
        '1 revisão gratuita por petição',
        'Revisão extra por advogado sênior (opcional)',
        'Consulta direta com redator via plataforma',
        '+3 petições bônus na renovação',
        'Acesso antecipado a novos recursos',
        'Validade: 90 dias',
        'Confidencialidade garantida (NDA)'
    ], 
    70, 
    true, 
    'dedicated'
)
ON CONFLICT (plan_code) DO NOTHING;

-- 5. Verificar o resultado final
SELECT plan_code, name, price, petitions_limit, api_access, support_level FROM plans ORDER BY price;

























