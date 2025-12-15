-- Script para configurar sistema de aprovação de redatores
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a coluna 'status' existe na tabela user_profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'status';

-- 2. Se a coluna não existir, adicionar ela
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN status VARCHAR(20) DEFAULT 'approved';
        
        RAISE NOTICE 'Coluna status adicionada à tabela user_profiles';
    ELSE
        RAISE NOTICE 'Coluna status já existe na tabela user_profiles';
    END IF;
END $$;

-- 3. Atualizar todos os redatores existentes para pending_approval
UPDATE user_profiles 
SET status = 'pending_approval'
WHERE role = 'writer';

-- 4. Manter clientes e admins como approved
UPDATE user_profiles 
SET status = 'approved'
WHERE role IN ('client', 'admin');

-- 5. Verificar o resultado
SELECT 
    firebase_uid,
    email,
    role,
    status,
    created_at
FROM user_profiles 
WHERE role = 'writer'
ORDER BY created_at DESC;

-- 6. Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;















