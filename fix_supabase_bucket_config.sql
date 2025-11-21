-- 1. Verificar configuração atual do bucket
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'writer-petitions';

-- 2. Atualizar configuração do bucket para aceitar PDFs
UPDATE storage.buckets 
SET 
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = ARRAY['application/pdf'],
  updated_at = NOW()
WHERE name = 'writer-petitions';

-- 3. Verificar se as políticas RLS estão corretas
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
WHERE tablename = 'objects' 
AND policyname LIKE '%writer%';

-- 4. Recriar políticas RLS para o bucket writer-petitions
DROP POLICY IF EXISTS "Writers can upload their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can view their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can update their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can delete their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can download all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Temporary writer petitions policy" ON storage.objects;

-- 5. Criar políticas RLS corretas
CREATE POLICY "Writers can upload their own petitions" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Writers can view their own petitions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Writers can update their own petitions" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Writers can delete their own petitions" ON storage.objects
FOR DELETE USING (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all petitions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'writer-petitions' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE firebase_uid = auth.uid()::text 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can download all petitions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'writer-petitions' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE firebase_uid = auth.uid()::text 
    AND role = 'admin'
  )
);

-- 6. Verificar configuração final
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE name = 'writer-petitions';















