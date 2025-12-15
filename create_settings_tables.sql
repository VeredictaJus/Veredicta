-- Script para criar as tabelas necessárias para o sistema de configurações
-- Execute este script no Supabase SQL Editor

-- 1. Tabela de planos
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_code TEXT UNIQUE NOT NULL, -- Código do plano (starter, professional, premium)
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    features TEXT[] DEFAULT '{}',
    petitions_limit INTEGER DEFAULT 50,
    api_access BOOLEAN DEFAULT false,
    support_level TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de assinaturas dos usuários
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    next_billing_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir planos padrão
INSERT INTO plans (plan_code, name, price, features, petitions_limit, api_access, support_level) VALUES
('starter', 'STARTER', 2000, ARRAY['Até 10 petições/mês', 'Suporte básico', 'Templates padrão'], 10, false, 'basic'),
('professional', 'PROFISSIONAL', 5000, ARRAY['Até 50 petições/mês', 'Suporte prioritário', 'API Access', 'Templates premium'], 50, true, 'priority'),
('premium', 'PREMIUM', 10000, ARRAY['Petições ilimitadas', 'Suporte dedicado', 'API completa', 'Customização'], 999999, true, 'dedicated')
ON CONFLICT (plan_code) DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_payment_cards_user_id ON user_payment_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_cards_default ON user_payment_cards(user_id, is_default);

-- Criar RLS (Row Level Security) - opcional, mas recomendado
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS básicas
CREATE POLICY "Plans are viewable by everyone" ON plans FOR SELECT USING (true);
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view their own payment cards" ON user_payment_cards FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own payment cards" ON user_payment_cards FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own payment cards" ON user_payment_cards FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own payment cards" ON user_payment_cards FOR DELETE USING (auth.uid()::text = user_id);
