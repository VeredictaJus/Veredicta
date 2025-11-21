-- Script para sincronizar dados entre profiles_v2 e user_profiles (CORRIGIDO)
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura das duas tabelas
SELECT 'profiles_v2' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles_v2'
UNION ALL
SELECT 'user_profiles' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY tabela, column_name;

-- 2. Verificar dados em profiles_v2 (usando colunas que existem)
SELECT 
    id as firebase_uid,
    email,
    user_type as role,
    full_name,
    created_at
FROM profiles_v2 
WHERE id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 3. Verificar dados em user_profiles (usando colunas que existem)
SELECT 
    firebase_uid,
    email,
    role,
    full_name,
    created_at
FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 4. Sincronizar dados do cliente de profiles_v2 para user_profiles
INSERT INTO user_profiles (
    firebase_uid,
    email,
    role,
    full_name,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    user_type,
    full_name,
    created_at,
    updated_at
FROM profiles_v2 
WHERE id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1'
ON CONFLICT (firebase_uid) 
DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    updated_at = NOW();

-- 5. Verificar se foi sincronizado
SELECT 
    firebase_uid,
    email,
    role,
    full_name,
    created_at
FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 6. Sincronizar TODOS os usuários de profiles_v2 para user_profiles
INSERT INTO user_profiles (
    firebase_uid,
    email,
    role,
    full_name,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    user_type,
    full_name,
    created_at,
    updated_at
FROM profiles_v2 
ON CONFLICT (firebase_uid) 
DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    updated_at = NOW();

-- 7. Verificar resultado final
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

























