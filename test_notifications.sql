-- Script para testar as configurações de notificação
-- Execute este script no Supabase SQL Editor

-- 1. Verificar dados atuais de notificações do usuário
SELECT 
    user_id,
    email_notifications,
    push_notifications,
    sms_notifications,
    two_factor_enabled,
    login_alerts
FROM user_settings 
WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 2. Testar atualização de notificações
UPDATE user_settings 
SET 
    email_notifications = true,
    push_notifications = false,
    sms_notifications = false,
    updated_at = NOW()
WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 3. Verificar se a atualização funcionou
SELECT 
    user_id,
    email_notifications,
    push_notifications,
    sms_notifications,
    updated_at
FROM user_settings 
WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 4. Testar atualização individual de email
UPDATE user_settings 
SET 
    email_notifications = false,
    updated_at = NOW()
WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 5. Verificar resultado final
SELECT 
    user_id,
    email_notifications,
    push_notifications,
    sms_notifications,
    updated_at
FROM user_settings 
WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

























