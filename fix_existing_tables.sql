-- Script para corrigir a tabela plans existente
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna plan_code se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plans' AND column_name = 'plan_code') THEN
        ALTER TABLE plans ADD COLUMN plan_code TEXT;
    END IF;
END $$;

-- 2. Atualizar registros existentes com plan_code baseado no id
UPDATE plans SET plan_code = 'starter' WHERE id::text LIKE '%starter%' OR name ILIKE '%starter%';
UPDATE plans SET plan_code = 'professional' WHERE id::text LIKE '%professional%' OR name ILIKE '%professional%';
UPDATE plans SET plan_code = 'premium' WHERE id::text LIKE '%premium%' OR name ILIKE '%premium%';

-- 3. Se ainda houver registros sem plan_code, definir valores padrão
UPDATE plans SET plan_code = 'starter' WHERE plan_code IS NULL AND price <= 2000;
UPDATE plans SET plan_code = 'professional' WHERE plan_code IS NULL AND price <= 5000;
UPDATE plans SET plan_code = 'premium' WHERE plan_code IS NULL AND price > 5000;

-- 4. Tornar plan_code NOT NULL após popular todos os registros
ALTER TABLE plans ALTER COLUMN plan_code SET NOT NULL;

-- 5. Adicionar constraint UNIQUE se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'plans' AND constraint_name = 'plans_plan_code_key') THEN
        ALTER TABLE plans ADD CONSTRAINT plans_plan_code_key UNIQUE (plan_code);
    END IF;
END $$;

-- 6. Inserir planos se não existirem
INSERT INTO plans (plan_code, name, price, features, petitions_limit, api_access, support_level) VALUES
('starter', 'STARTER', 2000, ARRAY['Até 10 petições/mês', 'Suporte básico', 'Templates padrão'], 10, false, 'basic'),
('professional', 'PROFISSIONAL', 5000, ARRAY['Até 50 petições/mês', 'Suporte prioritário', 'API Access', 'Templates premium'], 50, true, 'priority'),
('premium', 'PREMIUM', 10000, ARRAY['Petições ilimitadas', 'Suporte dedicado', 'API completa', 'Customização'], 999999, true, 'dedicated')
ON CONFLICT (plan_code) DO NOTHING;

-- 7. Criar tabela user_subscriptions se não existir
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    plan_code TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    next_billing_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Criar tabela user_payment_cards se não existir
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

-- 9. Criar tabela user_settings se não existir
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

-- 10. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_cards_user_id ON user_payment_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_cards_default ON user_payment_cards(user_id, is_default);

























