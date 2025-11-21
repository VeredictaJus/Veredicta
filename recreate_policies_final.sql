-- RECRIAR POLÍTICAS RLS PARA WRITER-PETITIONS
-- 1. Verificar se o bucket existe
SELECT
  name,
  allowed_mime_types,
  public
FROM storage.buckets
WHERE name = 'writer-petitions';

-- 2. Remover TODAS as políticas existentes para storage.objects
DROP POLICY IF EXISTS "Writers can upload their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can view their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can update their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can delete their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can download all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Temporary writer petitions policy" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on email" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON storage.objects;

-- 3. Criar políticas RLS para o bucket writer-petitions
-- Política para redatores fazerem upload de suas próprias petições
CREATE POLICY "Writers can upload their own petitions" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para redatores visualizarem suas próprias petições
CREATE POLICY "Writers can view their own petitions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para redatores atualizarem suas próprias petições
CREATE POLICY "Writers can update their own petitions" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para redatores deletarem suas próprias petições
CREATE POLICY "Writers can delete their own petitions" ON storage.objects
FOR DELETE USING (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para admins visualizarem todas as petições
CREATE POLICY "Admins can view all petitions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'writer-petitions' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE firebase_uid = auth.uid()::text
    AND role = 'admin'
  )
);

-- Política para admins fazerem download de todas as petições
CREATE POLICY "Admins can download all petitions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'writer-petitions' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE firebase_uid = auth.uid()::text
    AND role = 'admin'
  )
);

-- 4. Verificar se as políticas foram criadas
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

-- 5. Verificar configuração final do bucket
SELECT
  name,
  allowed_mime_types,
  file_size_limit,
  public,
  created_at,
  updated_at
FROM storage.buckets
WHERE name = 'writer-petitions';















