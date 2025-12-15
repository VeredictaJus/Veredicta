-- Teste final: Buscar petição com o client_id correto (como TEXT)

-- 1. Buscar a petição específica (como TEXT)
SELECT * FROM public.petitions 
WHERE client_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';

-- 2. Verificar se RLS está realmente desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'petitions' 
AND schemaname = 'public';
















