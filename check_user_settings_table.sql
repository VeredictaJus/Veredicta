-- Verificar se a tabela user_settings existe e sua estrutura
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se existem dados para o usuário
SELECT 
  user_id,
  billing_street,
  billing_city,
  billing_state,
  billing_zip_code,
  billing_country,
  created_at,
  updated_at
FROM user_settings 
WHERE user_id = 'yNTB2V3606WPxVOzLZxLQNV1tCm1';

-- Verificar se a tabela user_profiles tem os campos de billing
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
  AND column_name LIKE '%billing%'
ORDER BY ordinal_position;





















