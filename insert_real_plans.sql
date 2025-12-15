-- Script para inserir os planos corretos usando a estrutura REAL da tabela
-- Execute este script no Supabase SQL Editor

-- 1. Limpar dados existentes
TRUNCATE TABLE plans CASCADE;

-- 2. Adicionar constraint UNIQUE se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'plans_plan_code_unique'
    ) THEN
        ALTER TABLE plans ADD CONSTRAINT plans_plan_code_unique UNIQUE (plan_code);
    END IF;
END $$;

-- 3. INSERIR OS 4 PLANOS CORRETOS usando a estrutura real da tabela
INSERT INTO plans (
    name, 
    price, 
    petitions_included, 
    features, 
    description,
    priority_support, 
    custom_branding, 
    is_active, 
    subscribers,
    plan_code,
    petitions_limit,
    api_access,
    support_level
) VALUES
(
    'Free', 
    0,  -- Gratuito
    1,  -- petitions_included
    ARRAY[
        '1 petição gratuita',
        'Entrega em 3-5 dias úteis', 
        '1 revisão gratuita',
        'Consulta com redator e chat incluso',
        'Validade: 7 dias',
        'Confidencialidade garantida (NDA)'
    ], 
    'Plano gratuito para experimentar a plataforma',
    false,  -- priority_support
    false,  -- custom_branding
    true,   -- is_active
    0,      -- subscribers
    'free',
    1,      -- petitions_limit
    false,  -- api_access
    'basic'
),
(
    'Start', 
    52000,  -- R$ 520,00 em centavos
    4,      -- petitions_included
    ARRAY[
        '4 petições incluídas',
        'Até 3 dias úteis por entrega',
        '1 revisão gratuita no pacote',
        'Consulta com redator e chat incluso',
        'Validade: 30 dias',
        'Confidencialidade garantida (NDA)'
    ], 
    'Plano ideal para escritórios pequenos',
    false,  -- priority_support
    false,  -- custom_branding
    true,   -- is_active
    0,      -- subscribers
    'start',
    4,      -- petitions_limit
    false,  -- api_access
    'basic'
),
(
    'Pro', 
    168000,  -- R$ 1.680,00 em centavos
    14,      -- petitions_included
    ARRAY[
        '14 petições incluídas',
        'Entregas em até 2 dias úteis',
        '1 revisão gratuita por petição',
        'Consulta com redator e chat incluso',
        '+1 petição bônus na renovação',
        'Validade: 60 dias',
        'Confidencialidade garantida (NDA)'
    ], 
    'Plano mais popular para escritórios em crescimento',
    true,   -- priority_support
    false,  -- custom_branding
    true,   -- is_active
    0,      -- subscribers
    'pro',
    14,     -- petitions_limit
    true,   -- api_access
    'priority'
),
(
    'Elite', 
    700000,  -- R$ 7.000,00 em centavos
    70,      -- petitions_included
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
    'Plano premium para grandes escritórios',
    true,   -- priority_support
    true,   -- custom_branding
    true,   -- is_active
    0,      -- subscribers
    'elite',
    70,     -- petitions_limit
    true,   -- api_access
    'dedicated'
)
ON CONFLICT (plan_code) DO NOTHING;

-- 4. Verificar o resultado final
SELECT 
    plan_code, 
    name, 
    price, 
    petitions_included,
    petitions_limit,
    api_access, 
    support_level,
    priority_support,
    custom_branding
FROM plans 
ORDER BY price;

























