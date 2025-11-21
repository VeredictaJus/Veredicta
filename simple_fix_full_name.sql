-- Script SIMPLES para corrigir full_name
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela user_profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Verificar dados atuais do cliente
SELECT 
    firebase_uid,
    email,
    role,
    full_name,
    created_at
FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 3. Atualizar APENAS o full_name do cliente
UPDATE user_profiles 
SET 
    full_name = 'Natalia Yamao',
    updated_at = NOW()
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 4. Verificar se foi atualizado
SELECT 
    firebase_uid,
    email,
    role,
    full_name,
    created_at
FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 5. Verificar resultado final com planos
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
ORDER BY up.created_at DESC;

























