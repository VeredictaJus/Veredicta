-- Script para verificar a estrutura da tabela user_profiles
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todas as colunas da tabela user_profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Verificar se existe coluna 'company' ou similar
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND (column_name ILIKE '%company%' OR column_name ILIKE '%empresa%');

-- 3. Verificar dados atuais do usuário
SELECT * FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';