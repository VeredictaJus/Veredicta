-- Script para adicionar assinaturas de teste para todos os usuários
-- Execute este script no Supabase SQL Editor

-- 1. Ver usuários existentes
SELECT firebase_uid, full_name, email FROM user_profiles;

-- 2. Adicionar assinatura FREE para todos os usuários que não têm
INSERT INTO user_subscriptions (user_id, plan_code, status, next_billing_date)
SELECT 
    firebase_uid,
    'free', -- Plano FREE (1 petição)
    'active',
    NOW() + INTERVAL '7 days'
FROM user_profiles
WHERE firebase_uid NOT IN (SELECT user_id FROM user_subscriptions WHERE status = 'active')
ON CONFLICT (user_id, status) DO NOTHING;

-- 3. Verificar resultado
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

























