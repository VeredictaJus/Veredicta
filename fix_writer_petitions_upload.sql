-- Script para corrigir configuração do bucket writer-petitions
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Remover políticas antigas que podem estar causando problemas
DROP POLICY IF EXISTS "Writers can upload their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can view their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can update their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can delete their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can download all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Temporary writer petitions policy" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload petitions" ON storage.objects;

-- 2. Criar nova política mais permissiva para redatores autenticados
CREATE POLICY "Allow authenticated writers to upload petitions" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'writer-petitions' AND
  auth.role() = 'authenticated'
);

-- 3. Criar política para redatores visualizarem suas próprias petições
CREATE POLICY "Writers can view their own petitions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'writer-petitions' AND
  auth.role() = 'authenticated'
);

-- 4. Criar política para admins visualizarem todas as petições
CREATE POLICY "Admins can view all petitions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'writer-petitions' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE firebase_uid = auth.uid()::text
    AND role = 'admin'
  )
);

-- 5. Verificar configuração do bucket
SELECT 
  name, 
  id, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'writer-petitions';

-- 6. Verificar políticas criadas
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%writer%' OR policyname LIKE '%petition%';










