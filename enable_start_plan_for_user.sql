-- Script para habilitar o plano START para o usuário anajulia-13@hotmail.com
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário existe e obter o firebase_uid
SELECT 
    firebase_uid, 
    email, 
    full_name,
    role
FROM user_profiles 
WHERE email = 'anajulia-13@hotmail.com';

-- 2. Cancelar qualquer assinatura ativa existente (se houver)
UPDATE user_subscriptions 
SET status = 'cancelled', 
    updated_at = NOW()
WHERE user_id IN (
    SELECT firebase_uid 
    FROM user_profiles 
    WHERE email = 'anajulia-13@hotmail.com'
)
AND status = 'active';

-- 3. Inserir nova assinatura com plano START
INSERT INTO user_subscriptions (
    user_id, 
    plan_code, 
    status, 
    next_billing_date,
    created_at,
    updated_at
)
SELECT 
    firebase_uid,
    'start', -- Plano START (4 petições)
    'active',
    NOW() + INTERVAL '30 days', -- Válido por 30 dias
    NOW(),
    NOW()
FROM user_profiles
WHERE email = 'anajulia-13@hotmail.com'
ON CONFLICT (user_id, status) 
DO UPDATE SET
    plan_code = EXCLUDED.plan_code,
    next_billing_date = EXCLUDED.next_billing_date,
    updated_at = NOW();

-- 4. Verificar se a assinatura foi criada/atualizada com sucesso
SELECT 
    up.firebase_uid,
    up.email,
    up.full_name,
    us.plan_code,
    us.status,
    us.next_billing_date,
    p.name as plan_name,
    p.petitions_limit,
    p.price,
    us.created_at as subscription_created_at,
    us.updated_at as subscription_updated_at
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id AND us.status = 'active'
LEFT JOIN plans p ON us.plan_code = p.plan_code
WHERE up.email = 'anajulia-13@hotmail.com';

