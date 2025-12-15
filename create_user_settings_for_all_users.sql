-- Script para criar user_settings para TODOS os usuários que não têm

-- 1. Verificar usuários que têm perfil mas não têm user_settings
SELECT 
    up.firebase_uid,
    up.full_name,
    up.email,
    up.role,
    us.user_id as has_user_settings
FROM user_profiles up
LEFT JOIN user_settings us ON UPPER(up.firebase_uid) = us.user_id
WHERE us.user_id IS NULL
ORDER BY up.created_at DESC;

-- 2. Criar user_settings para usuários que não têm
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
    login_alerts,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at
)
SELECT 
    UPPER(up.firebase_uid) as user_id,
    up.full_name,
    up.phone,
    up.company_name as company,
    up.document,
    up.avatar_url,
    true as email_notifications,
    false as push_notifications,
    true as sms_notifications,
    false as two_factor_enabled,
    true as login_alerts,
    NULL as billing_street,
    NULL as billing_city,
    NULL as billing_state,
    NULL as billing_zip_code,
    'Brasil' as billing_country,
    NOW() as created_at,
    NOW() as updated_at
FROM user_profiles up
LEFT JOIN user_settings us ON UPPER(up.firebase_uid) = us.user_id
WHERE us.user_id IS NULL
AND up.firebase_uid IS NOT NULL;

-- 3. Verificar resultado
SELECT 
    COUNT(*) as total_user_profiles
FROM user_profiles;

SELECT 
    COUNT(*) as total_user_settings
FROM user_settings;

-- 4. Verificar se todos os usuários agora têm user_settings
SELECT 
    up.firebase_uid,
    up.full_name,
    up.email,
    up.role,
    CASE 
        WHEN us.user_id IS NOT NULL THEN '✅ TEM user_settings'
        ELSE '❌ NÃO TEM user_settings'
    END as status
FROM user_profiles up
LEFT JOIN user_settings us ON UPPER(up.firebase_uid) = us.user_id
ORDER BY up.created_at DESC;





















