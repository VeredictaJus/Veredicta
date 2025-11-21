-- Script completo para corrigir a tabela user_settings
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_settings';

-- 2. Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    sms_notifications BOOLEAN DEFAULT true,
    two_factor_enabled BOOLEAN DEFAULT false,
    login_alerts BOOLEAN DEFAULT true,
    billing_street TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_zip_code TEXT,
    billing_country TEXT DEFAULT 'Brasil',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 4. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

-- 5. Criar políticas corretas
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
    FOR DELETE USING (auth.uid()::text = user_id);

-- 6. Criar índice único em user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_settings_user_id_unique ON user_settings(user_id);

-- 7. Verificar se tudo foi criado corretamente
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_settings';

SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_settings'
ORDER BY policyname;

-- 8. Testar inserção para o usuário atual
INSERT INTO user_settings (user_id, email_notifications, push_notifications)
VALUES ('YNTB2V3606WPxV0zlZxLQNV1tCm1', true, false)
ON CONFLICT (user_id) DO UPDATE SET
    email_notifications = EXCLUDED.email_notifications,
    push_notifications = EXCLUDED.push_notifications,
    updated_at = NOW();

-- 9. Verificar se a inserção funcionou
SELECT * FROM user_settings WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';
