-- Script para REMOVER assinaturas de redatores e admins
-- Execute este script no Supabase SQL Editor

-- 1. Ver usuários atuais com assinaturas
SELECT 
    up.firebase_uid,
    up.full_name,
    up.email,
    us.plan_code,
    us.status,
    p.name as plan_name
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id AND us.status = 'active'
LEFT JOIN plans p ON us.plan_code = p.plan_code
ORDER BY up.created_at DESC;

-- 2. Remover assinaturas de REDATORES (usuários com email contendo 'veredictajus.com')
DELETE FROM user_subscriptions 
WHERE user_id IN (
    SELECT firebase_uid 
    FROM user_profiles 
    WHERE email LIKE '%@veredictajus.com'
);

-- 3. Remover assinaturas de ADMINS (usuário support-admin)
DELETE FROM user_subscriptions 
WHERE user_id = 'support-admin';

-- 4. Verificar resultado - apenas clientes devem ter assinaturas
SELECT 
    up.firebase_uid,
    up.full_name,
    up.email,
    us.plan_code,
    us.status,
    p.name as plan_name,
    p.petitions_limit
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id AND us.status = 'active'
LEFT JOIN plans p ON us.plan_code = p.plan_code
ORDER BY up.created_at DESC;

























