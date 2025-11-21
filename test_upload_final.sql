-- TESTE FINAL - VERIFICAR CONFIGURAÇÃO COMPLETA

-- 1. Verificar bucket writer-petitions
SELECT
  name,
  allowed_mime_types,
  file_size_limit,
  public,
  created_at,
  updated_at
FROM storage.buckets
WHERE name = 'writer-petitions';

-- 2. Verificar políticas RLS ativas
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%writer%'
ORDER BY policyname;

-- 3. Verificar se a tabela user_profiles tem a coluna status
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
AND column_name = 'status';

-- 4. Verificar se a função RPC existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'create_or_update_user_profile';

-- 5. Verificar usuários de teste (se existirem)
SELECT 
  firebase_uid,
  email,
  role,
  status,
  created_at
FROM user_profiles
WHERE email LIKE '%teste%' OR email LIKE '%@exemplo.com'
ORDER BY created_at DESC
LIMIT 5;















