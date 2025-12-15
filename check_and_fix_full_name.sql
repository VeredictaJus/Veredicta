-- Script para verificar estruturas e corrigir full_name
-- Execute este script no Supabase SQL Editor

-- 1. Verificar TODAS as colunas da tabela profiles_v2
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles_v2' 
ORDER BY ordinal_position;

-- 2. Verificar TODAS as colunas da tabela user_profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 3. Verificar dados em profiles_v2 (usando apenas colunas que existem)
SELECT * FROM profiles_v2 WHERE id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 4. Verificar dados em user_profiles (usando apenas colunas que existem)
SELECT * FROM user_profiles WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 5. Atualizar APENAS o full_name do cliente na user_profiles
UPDATE user_profiles 
SET 
    full_name = 'Natalia Yamao',
    updated_at = NOW()
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 6. Verificar se foi atualizado
SELECT 
    firebase_uid,
    email,
    role,
    full_name,
    created_at
FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 7. Verificar resultado final com planos
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

























