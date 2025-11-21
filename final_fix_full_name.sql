-- Script FINAL para corrigir full_name do cliente
-- Execute este script no Supabase SQL Editor

-- 1. Atualizar APENAS o full_name do cliente
UPDATE user_profiles 
SET 
    full_name = 'Natalia Yamao',
    updated_at = NOW()
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 2. Verificar se foi atualizado
SELECT 
    up.firebase_uid,
    up.email,
    up.role,
    up.full_name,
    us.plan_code,
    p.name as plan_name,
    p.petitions_limit
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id AND us.status = 'active'
LEFT JOIN plans p ON us.plan_code = p.plan_code
WHERE up.firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

























