-- DIAGNÓSTICO COMPLETO DAS POLÍTICAS RLS

-- 1. Verificar se a tabela storage.objects existe
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 2. Verificar se RLS está habilitado na tabela storage.objects
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 3. Verificar TODAS as políticas na tabela storage.objects (sem filtro)
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 4. Verificar especificamente políticas com 'writer' no nome
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%writer%'
ORDER BY policyname;

-- 5. Verificar se há políticas para o bucket 'writer-petitions'
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (qual LIKE '%writer-petitions%' OR with_check LIKE '%writer-petitions%')
ORDER BY policyname;

-- 6. Verificar permissões do usuário atual
SELECT 
  current_user,
  session_user,
  current_database();

-- 7. Verificar se o schema 'storage' está no search_path
SHOW search_path;















