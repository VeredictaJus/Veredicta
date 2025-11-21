-- VERIFICAR E CORRIGIR POLÍTICAS RLS - URGENTE

-- 1. Verificar se as políticas existem
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%writer%';

-- 2. Se não existirem, criar novamente
-- Primeiro, remover qualquer política existente
DROP POLICY IF EXISTS "Writers can upload their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can view their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can update their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can delete their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can download all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Temporary writer petitions policy" ON storage.objects;

-- 3. Criar políticas RLS corretas
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

-- 4. Verificação final
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%writer%';















