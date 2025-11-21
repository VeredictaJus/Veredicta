-- Script para corrigir TODOS os redatores existentes
-- Execute este script no Supabase SQL Editor

-- 1. Verificar quantos redatores existem
SELECT 
  COUNT(*) as total_redatores,
  COUNT(CASE WHEN role = 'writer' THEN 1 END) as redatores_corretos,
  COUNT(CASE WHEN role = 'client' THEN 1 END) as redatores_incorretos
FROM user_profiles 
WHERE role IN ('writer', 'client');

-- 2. Listar todos os redatores com role incorreto
SELECT firebase_uid, email, role, status, full_name, created_at
FROM user_profiles 
WHERE role = 'client' 
  AND email LIKE '%@%'  -- Apenas emails válidos
ORDER BY created_at DESC;

-- 3. Corrigir TODOS os redatores que estão como 'client'
-- ATENÇÃO: Este comando vai alterar todos os usuários que estão como 'client'
-- Certifique-se de que realmente são redatores antes de executar
UPDATE user_profiles 
SET 
  role = 'writer', 
  status = 'pending_approval',
  updated_at = NOW()
WHERE role = 'client' 
  AND email LIKE '%@%'  -- Apenas emails válidos
  AND firebase_uid IS NOT NULL;

-- 4. Verificar o resultado
SELECT 
  COUNT(*) as total_redatores,
  COUNT(CASE WHEN role = 'writer' THEN 1 END) as redatores_corretos,
  COUNT(CASE WHEN role = 'client' THEN 1 END) as redatores_incorretos
FROM user_profiles 
WHERE role IN ('writer', 'client');

-- 5. Listar todos os redatores após a correção
SELECT firebase_uid, email, role, status, full_name, updated_at
FROM user_profiles 
WHERE role = 'writer'
ORDER BY updated_at DESC;















