-- Script SIMPLES para sincronizar dados entre profiles_v2 e user_profiles
-- Execute este script no Supabase SQL Editor

-- 1. PRIMEIRO: Verificar estrutura das duas tabelas
SELECT 'profiles_v2' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles_v2'
UNION ALL
SELECT 'user_profiles' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY tabela, column_name;

-- 2. Verificar dados em profiles_v2 (usando apenas colunas básicas)
SELECT 
    id,
    email,
    full_name,
    created_at
FROM profiles_v2 
WHERE id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 3. Verificar dados em user_profiles (usando apenas colunas básicas)
SELECT 
    firebase_uid,
    email,
    role,
    full_name,
    created_at
FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 4. Atualizar APENAS o full_name do cliente (método mais seguro)
UPDATE user_profiles 
SET 
    full_name = 'Natalia Yamao',
    updated_at = NOW()
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 5. Verificar se foi atualizado
SELECT 
    firebase_uid,
    email,
    role,
    full_name,
    created_at
FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 6. Verificar resultado final com planos
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

























