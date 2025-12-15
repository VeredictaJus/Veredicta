-- Script para verificar e corrigir o full_name do cliente
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela user_profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Verificar dados do cliente na tabela user_profiles (apenas colunas que existem)
SELECT 
    firebase_uid,
    full_name,
    email,
    phone,
    document,
    created_at
FROM user_profiles 
WHERE email = 'adv.nataliayamao@gmail.com';

-- 3. Atualizar o full_name do cliente (baseado no email)
UPDATE user_profiles 
SET full_name = 'Natalia Yamao'
WHERE email = 'adv.nataliayamao@gmail.com';

-- 4. Verificar se foi atualizado
SELECT 
    firebase_uid,
    full_name,
    email,
    phone,
    document,
    created_at
FROM user_profiles 
WHERE email = 'adv.nataliayamao@gmail.com';

-- 5. Verificar todos os usuários com full_name NULL
SELECT 
    firebase_uid,
    full_name,
    email,
    created_at
FROM user_profiles 
WHERE full_name IS NULL;
