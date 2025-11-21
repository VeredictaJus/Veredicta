-- Script para investigar onde estão as petições

-- 1. Verificar se existem petições na tabela petitions
SELECT 
  COUNT(*) as total_petitions,
  COUNT(CASE WHEN client_id IS NOT NULL THEN 1 END) as with_client_id,
  COUNT(CASE WHEN client_id IS NULL THEN 1 END) as without_client_id
FROM public.petitions;

-- 2. Verificar petições do usuário atual (substitua pelo UUID do seu usuário)
-- SELECT * FROM public.petitions WHERE client_id = 'SEU_UUID_AQUI';

-- 3. Verificar todas as petições (últimas 10)
SELECT 
  id,
  client_id,
  title,
  status,
  created_at,
  updated_at
FROM public.petitions 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Verificar se a função RPC existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'get_client_petitions' 
AND routine_schema = 'public';

-- 5. Verificar políticas RLS na tabela petitions
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'petitions';
















