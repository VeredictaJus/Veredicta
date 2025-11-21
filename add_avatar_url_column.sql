-- Script para adicionar coluna avatar_url na tabela user_profiles
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela user_profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Adicionar coluna avatar_url se não existir
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 4. Testar inserção/atualização (opcional)
UPDATE user_profiles 
SET avatar_url = 'teste' 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 5. Verificar se funcionou
SELECT firebase_uid, email, avatar_url 
FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

























