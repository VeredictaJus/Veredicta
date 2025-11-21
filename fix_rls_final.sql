-- Script para resolver definitivamente o problema RLS
-- Execute este script no Supabase SQL Editor

-- 1. REMOVER TODAS AS POLÍTICAS RLS (para limpar completamente)
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;
DROP POLICY IF EXISTS "Allow all operations on user_settings" ON user_settings;

-- 2. CRIAR POLÍTICA PERMISSIVA (temporária para teste)
CREATE POLICY "Allow all operations on user_settings" ON user_settings
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Verificar se a política foi criada
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 4. Testar inserção completa
INSERT INTO user_settings (
    user_id,
    full_name,
    phone,
    company,
    document,
    avatar_url,
    email_notifications,
    push_notifications,
    sms_notifications,
    two_factor_enabled,
    login_alerts
) VALUES (
    'YNTB2V3606WPxV0zlZxLQNV1tCm1',
    'Natalia Yamao',
    '11999999999',
    'Empresa Teste',
    '12345678901',
    'data:image/png;base64,teste',
    true,
    false,
    true,
    false,
    true
) ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    company = EXCLUDED.company,
    document = EXCLUDED.document,
    avatar_url = EXCLUDED.avatar_url,
    email_notifications = EXCLUDED.email_notifications,
    push_notifications = EXCLUDED.push_notifications,
    sms_notifications = EXCLUDED.sms_notifications,
    two_factor_enabled = EXCLUDED.two_factor_enabled,
    login_alerts = EXCLUDED.login_alerts,
    updated_at = NOW();

-- 5. Verificar se funcionou
SELECT * FROM user_settings WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

























