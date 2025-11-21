-- Verificar a função RPC atual no Supabase
SELECT
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'create_or_update_user_profile'
AND routine_schema = 'public';

-- Verificar os parâmetros da função
SELECT
  parameter_name,
  data_type,
  parameter_default
FROM information_schema.parameters
WHERE specific_name = (
  SELECT specific_name
  FROM information_schema.routines
  WHERE routine_name = 'create_or_update_user_profile'
  AND routine_schema = 'public'
);

-- Testar a função diretamente com um redator
SELECT create_or_update_user_profile(
  'test-debug-writer-789',
  'debug-writer@teste.com',
  'writer',
  'João Debug',
  NULL,
  NULL,
  '11999999999',
  'Rua Debug, 123'
);

-- Verificar o resultado do teste
SELECT firebase_uid, email, role, status, full_name
FROM user_profiles
WHERE firebase_uid = 'test-debug-writer-789';

-- Limpar o teste
DELETE FROM user_profiles WHERE firebase_uid = 'test-debug-writer-789';















