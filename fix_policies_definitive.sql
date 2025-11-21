-- CORREÇÃO DEFINITIVA DAS POLÍTICAS RLS - URGENTE

-- 1. Verificar se as políticas existem (busca mais ampla)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects';

-- 2. Verificar se a tabela storage.objects existe
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. Remover TODAS as políticas existentes para storage.objects
DROP POLICY IF EXISTS "Writers can upload their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can view their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can update their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can delete their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can download all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Temporary writer petitions policy" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on email" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON storage.objects;

-- 4. Criar políticas RLS corretas para o bucket writer-petitions
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

-- 5. Verificação final - buscar todas as políticas
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
ORDER BY policyname;















