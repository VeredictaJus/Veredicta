-- Investigar o client_id real da petição

-- 1. Ver todas as petições (sem filtro)
SELECT 
  id,
  client_id,
  client_id::text as client_id_text,
  title,
  status,
  created_at
FROM public.petitions 
ORDER BY created_at DESC;

-- 2. Verificar o tipo de dados da coluna client_id
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'petitions' 
AND column_name = 'client_id';
















