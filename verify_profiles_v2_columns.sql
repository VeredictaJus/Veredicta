-- Verificar todas as colunas existentes na tabela profiles_v2

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles_v2'
ORDER BY ordinal_position;









