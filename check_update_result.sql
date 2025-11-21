-- Script para verificar se a atualização funcionou
-- Execute este script no Supabase SQL Editor

-- 1. Verificar APENAS a tabela user_profiles (sem JOINs)
SELECT 
    firebase_uid,
    email,
    role,
    full_name,
    created_at,
    updated_at
FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 2. Verificar se existe assinatura para este usuário
SELECT 
    user_id,
    plan_code,
    status,
    created_at
FROM user_subscriptions 
WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 3. Verificar se existe plano FREE
SELECT 
    plan_code,
    name,
    petitions_limit,
    price
FROM plans 
WHERE plan_code = 'free';

























