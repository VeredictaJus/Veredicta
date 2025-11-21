-- Script para corrigir TODOS os redatores existentes definitivamente
-- Execute este script no Supabase SQL Editor

-- 1. Verificar situação atual
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'writer' THEN 1 END) as redatores_corretos,
  COUNT(CASE WHEN role = 'client' THEN 1 END) as redatores_incorretos,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM user_profiles 
WHERE role IN ('writer', 'client', 'admin');

-- 2. Listar todos os usuários com role incorreto (que deveriam ser redatores)
SELECT firebase_uid, email, role, status, full_name, created_at
FROM user_profiles 
WHERE role = 'client' 
  AND email LIKE '%@%'  -- Apenas emails válidos
  AND firebase_uid IS NOT NULL
ORDER BY created_at DESC;

-- 3. CORREÇÃO DEFINITIVA: Atualizar todos os usuários que estão como 'client' para 'writer'
-- ATENÇÃO: Este comando vai alterar TODOS os usuários que estão como 'client'
-- Certifique-se de que realmente são redatores antes de executar
UPDATE user_profiles 
SET 
  role = 'writer', 
  status = 'pending_approval',
  updated_at = NOW()
WHERE role = 'client' 
  AND email LIKE '%@%'  -- Apenas emails válidos
  AND firebase_uid IS NOT NULL;

-- 4. Verificar o resultado da correção
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'writer' THEN 1 END) as redatores_corretos,
  COUNT(CASE WHEN role = 'client' THEN 1 END) as redatores_incorretos,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM user_profiles 
WHERE role IN ('writer', 'client', 'admin');

-- 5. Listar todos os redatores após a correção
SELECT firebase_uid, email, role, status, full_name, updated_at
FROM user_profiles 
WHERE role = 'writer'
ORDER BY updated_at DESC;

-- 6. Verificar se há algum usuário que ainda está como 'client' (não deveria haver)
SELECT firebase_uid, email, role, status, full_name
FROM user_profiles 
WHERE role = 'client'
  AND email LIKE '%@%';















