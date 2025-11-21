-- Verificar o usuário específico que está sendo criado como client
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o usuário específico dos logs
SELECT firebase_uid, email, role, status, full_name, created_at
FROM user_profiles 
WHERE firebase_uid = 'H26ZVtuF62QXkk1omTzKqGePcCc2';

-- 2. Verificar se há algum problema na função RPC
-- Vamos testar novamente com um UID diferente
SELECT create_or_update_user_profile(
  'test-writer-debug-456',
  'debug-writer@teste.com',
  'writer',
  'João Debug',
  NULL,
  NULL,
  '11999999999',
  'Rua Debug, 123'
);

-- 3. Verificar o resultado
SELECT firebase_uid, email, role, status, full_name
FROM user_profiles 
WHERE firebase_uid = 'test-writer-debug-456';

-- 4. Limpar o teste
DELETE FROM user_profiles WHERE firebase_uid = 'test-writer-debug-456';















