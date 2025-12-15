-- Script para corrigir o usuário específico e investigar o problema
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o usuário atual
SELECT firebase_uid, email, role, status, full_name, created_at, updated_at
FROM user_profiles 
WHERE firebase_uid = 'H26ZVtuF62QXkk1omTzKqGePcCc2';

-- 2. Forçar atualização do role e status
UPDATE user_profiles 
SET 
  role = 'writer', 
  status = 'pending_approval',
  updated_at = NOW()
WHERE firebase_uid = 'H26ZVtuF62QXkk1omTzKqGePcCc2';

-- 3. Verificar se a atualização funcionou
SELECT firebase_uid, email, role, status, full_name, updated_at
FROM user_profiles 
WHERE firebase_uid = 'H26ZVtuF62QXkk1omTzKqGePcCc2';

-- 4. Testar a função RPC novamente com um novo usuário
SELECT create_or_update_user_profile(
  'test-writer-final-789',
  'final-test@teste.com',
  'writer',
  'Maria Final',
  NULL,
  NULL,
  '11999999999',
  'Rua Final, 123'
);

-- 5. Verificar o resultado
SELECT firebase_uid, email, role, status, full_name
FROM user_profiles 
WHERE firebase_uid = 'test-writer-final-789';

-- 6. Limpar o teste
DELETE FROM user_profiles WHERE firebase_uid = 'test-writer-final-789';















