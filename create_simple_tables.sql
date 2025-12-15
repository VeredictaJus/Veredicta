-- Script SIMPLES para criar apenas as tabelas essenciais
-- Execute este script no Supabase SQL Editor

-- 1. Tabela de planos (sem foreign keys complexas)
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    features TEXT[] DEFAULT '{}',
    petitions_limit INTEGER DEFAULT 50,
    api_access BOOLEAN DEFAULT false,
    support_level TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de assinaturas (sem foreign key por enquanto)
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    plan_code TEXT NOT NULL, -- Usar plan_code em vez de UUID
    status TEXT DEFAULT 'active',
    next_billing_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de cartões de pagamento
CREATE TABLE IF NOT EXISTS user_payment_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    last_four TEXT NOT NULL,
    brand TEXT NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    holder_name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    sms_notifications BOOLEAN DEFAULT true,
    two_factor_enabled BOOLEAN DEFAULT false,
    login_alerts BOOLEAN DEFAULT true,
    last_password_change TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir planos padrão
INSERT INTO plans (plan_code, name, price, features, petitions_limit, api_access, support_level) VALUES
('starter', 'STARTER', 2000, ARRAY['Até 10 petições/mês', 'Suporte básico', 'Templates padrão'], 10, false, 'basic'),
('professional', 'PROFISSIONAL', 5000, ARRAY['Até 50 petições/mês', 'Suporte prioritário', 'API Access', 'Templates premium'], 50, true, 'priority'),
('premium', 'PREMIUM', 10000, ARRAY['Petições ilimitadas', 'Suporte dedicado', 'API completa', 'Customização'], 999999, true, 'dedicated')
ON CONFLICT (plan_code) DO NOTHING;

-- Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_cards_user_id ON user_payment_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_cards_default ON user_payment_cards(user_id, is_default);

























