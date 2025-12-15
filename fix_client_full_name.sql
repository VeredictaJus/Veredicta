-- Script para verificar e corrigir o full_name do cliente
-- Execute este script no Supabase SQL Editor

-- 1. Verificar dados do cliente na tabela user_profiles
SELECT 
    firebase_uid,
    full_name,
    email,
    phone,
    company,
    document,
    created_at
FROM user_profiles 
WHERE email = 'adv.nataliayamao@gmail.com';

-- 2. Atualizar o full_name do cliente (baseado no email)
UPDATE user_profiles 
SET full_name = 'Natalia Yamada'
WHERE email = 'adv.nataliayamao@gmail.com';

-- 3. Verificar se foi atualizado
SELECT 
    firebase_uid,
    full_name,
    email,
    phone,
    company,
    document,
    created_at
FROM user_profiles 
WHERE email = 'adv.nataliayamao@gmail.com';

-- 4. Verificar todos os usuários com full_name NULL
SELECT 
    firebase_uid,
    full_name,
    email,
    created_at
FROM user_profiles 
WHERE full_name IS NULL;

























