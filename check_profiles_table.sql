-- 🔍 VERIFICAR SE A TABELA PROFILES EXISTE
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 🔍 VERIFICAR SE HÁ DADOS NA TABELA PROFILES
SELECT COUNT(*) as total_profiles FROM profiles;

-- 🔍 VERIFICAR ESTRUTURA DA TABELA PROFILES
\d profiles;























