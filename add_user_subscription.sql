-- Script para adicionar uma assinatura de teste para o usuário atual
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários existentes na tabela user_profiles
SELECT firebase_uid, full_name, email FROM user_profiles LIMIT 5;

-- 2. Criar uma assinatura para o usuário "adv.nataliayamao" (baseado na imagem)
-- Substitua o firebase_uid abaixo pelo UID real do usuário
INSERT INTO user_subscriptions (
    user_id, 
    plan_code, 
    status, 
    next_billing_date
) VALUES (
    'firebase_uid_do_usuario_aqui', -- SUBSTITUA pelo firebase_uid real
    'start', -- Plano START (4 petições)
    'active',
    NOW() + INTERVAL '30 days'
)
ON CONFLICT (user_id, status) DO UPDATE SET
    plan_code = EXCLUDED.plan_code,
    next_billing_date = EXCLUDED.next_billing_date;

-- 3. Ou criar assinaturas para diferentes planos (descomente a que quiser testar):

-- Para plano FREE (1 petição):
/*
INSERT INTO user_subscriptions (user_id, plan_code, status, next_billing_date) VALUES 
('firebase_uid_do_usuario_aqui', 'free', 'active', NOW() + INTERVAL '7 days')
ON CONFLICT (user_id, status) DO UPDATE SET plan_code = 'free';
*/

-- Para plano PRO (14 petições):
/*
INSERT INTO user_subscriptions (user_id, plan_code, status, next_billing_date) VALUES 
('firebase_uid_do_usuario_aqui', 'pro', 'active', NOW() + INTERVAL '60 days')
ON CONFLICT (user_id, status) DO UPDATE SET plan_code = 'pro';
*/

-- Para plano ELITE (70 petições):
/*
INSERT INTO user_subscriptions (user_id, plan_code, status, next_billing_date) VALUES 
('firebase_uid_do_usuario_aqui', 'elite', 'active', NOW() + INTERVAL '90 days')
ON CONFLICT (user_id, status) DO UPDATE SET plan_code = 'elite';
*/

-- 4. Verificar se a assinatura foi criada
SELECT 
    us.user_id,
    us.plan_code,
    us.status,
    p.name,
    p.petitions_limit,
    p.price
FROM user_subscriptions us
JOIN plans p ON us.plan_code = p.plan_code
WHERE us.user_id = 'firebase_uid_do_usuario_aqui'; -- SUBSTITUA pelo firebase_uid real

























