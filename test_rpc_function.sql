-- Testar a função RPC create_or_update_user_profile
-- Execute este script no Supabase SQL Editor

-- 1. Testar com role 'writer'
SELECT create_or_update_user_profile(
  'test-writer-uid-123',
  'test-writer@teste.com',
  'writer',
  'João Silva',
  NULL,
  NULL,
  '11999999999',
  'Rua Teste, 123'
);

-- 2. Verificar o resultado
SELECT firebase_uid, email, role, status, full_name
FROM user_profiles 
WHERE firebase_uid = 'test-writer-uid-123';

-- 3. Limpar o teste
DELETE FROM user_profiles WHERE firebase_uid = 'test-writer-uid-123';















