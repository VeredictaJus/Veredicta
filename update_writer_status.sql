-- Script para atualizar status de redatores para pending_approval
-- Execute este script no Supabase SQL Editor

-- 1. Verificar redatores existentes
SELECT 
    firebase_uid,
    email,
    role,
    status,
    created_at
FROM user_profiles 
WHERE role = 'writer'
ORDER BY created_at DESC;

-- 2. Atualizar TODOS os redatores para pending_approval
UPDATE user_profiles 
SET status = 'pending_approval'
WHERE role = 'writer';

-- 3. Verificar se a atualização funcionou
SELECT 
    firebase_uid,
    email,
    role,
    status,
    created_at
FROM user_profiles 
WHERE role = 'writer'
ORDER BY created_at DESC;

-- 4. Para aprovar um redator específico (substitua o email)
-- UPDATE user_profiles 
-- SET status = 'approved'
-- WHERE email = 'redator.teste@veredicta.com';

-- 5. Para rejeitar um redator específico (substitua o email)
-- UPDATE user_profiles 
-- SET status = 'rejected'
-- WHERE email = 'redator.teste@veredicta.com';















