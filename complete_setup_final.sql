-- Script CORRIGIDO: Criar tabelas + Inserir planos + Adicionar assinaturas
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela user_subscriptions se não existir
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    plan_code TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    next_billing_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar constraint UNIQUE simples (sem DEFERRABLE)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_user_id_status_key'
    ) THEN
        ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_status_key UNIQUE (user_id, status);
    END IF;
END $$;

-- 3. Criar tabela user_payment_cards se não existir
CREATE TABLE IF NOT EXISTS user_payment_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    last_four TEXT NOT NULL,
    brand TEXT NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    holder_name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela user_settings se não existir
CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    company TEXT,
    document TEXT,
    avatar_url TEXT,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    sms_notifications BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    login_alerts BOOLEAN DEFAULT true,
    last_password_change TIMESTAMP WITH TIME ZONE,
    billing_street TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_zip_code TEXT,
    billing_country TEXT DEFAULT 'Brasil',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Limpar e inserir os planos corretos
TRUNCATE TABLE plans CASCADE;

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

-- 6. Adicionar assinatura FREE para todos os usuários que não têm
INSERT INTO user_subscriptions (user_id, plan_code, status, next_billing_date)
SELECT 
    firebase_uid,
    'free', -- Plano FREE (1 petição)
    'active',
    NOW() + INTERVAL '7 days'
FROM user_profiles
WHERE firebase_uid NOT IN (SELECT user_id FROM user_subscriptions WHERE status = 'active')
ON CONFLICT (user_id, status) DO NOTHING;

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_payment_cards_user_id ON user_payment_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 9. Políticas RLS básicas (com cast correto de UUID para TEXT)
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid()::text = user_id);

-- Políticas para user_payment_cards
DROP POLICY IF EXISTS "Users can view their own payment cards" ON user_payment_cards;
CREATE POLICY "Users can view their own payment cards" ON user_payment_cards FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own payment cards" ON user_payment_cards;
CREATE POLICY "Users can insert their own payment cards" ON user_payment_cards FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own payment cards" ON user_payment_cards;
CREATE POLICY "Users can update their own payment cards" ON user_payment_cards FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own payment cards" ON user_payment_cards;
CREATE POLICY "Users can delete their own payment cards" ON user_payment_cards FOR DELETE USING (auth.uid()::text = user_id);

-- Políticas para user_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid()::text = user_id);

-- 10. Verificar resultado final
SELECT 
    up.firebase_uid,
    up.full_name,
    up.email,
    us.plan_code,
    us.status,
    p.name as plan_name,
    p.petitions_limit,
    p.price
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id AND us.status = 'active'
LEFT JOIN plans p ON us.plan_code = p.plan_code
ORDER BY up.created_at DESC;

























