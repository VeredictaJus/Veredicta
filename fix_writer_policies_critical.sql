-- CORREÇÃO CRÍTICA DAS POLÍTICAS RLS PARA 'writer-petitions'

-- 1. Remover todas as políticas existentes para o bucket 'writer-petitions'
DROP POLICY IF EXISTS "Writers can upload their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can view their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can update their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can delete their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can download all petitions" ON storage.objects;

-- 2. Criar políticas RLS corretas para o bucket writer-petitions
-- Política para redatores fazerem upload de suas próprias petições
CREATE POLICY "Writers can upload their own petitions" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para redatores visualizarem suas próprias petições
CREATE POLICY "Writers can view their own petitions" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para redatores atualizarem suas próprias petições
CREATE POLICY "Writers can update their own petitions" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para redatores deletarem suas próprias petições
CREATE POLICY "Writers can delete their own petitions" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'writer-petitions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para admins visualizarem todas as petições
CREATE POLICY "Admins can view all petitions" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'writer-petitions' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE firebase_uid = auth.uid()::text
    AND role = 'admin'
  )
);

-- Política para admins fazerem download de todas as petições
CREATE POLICY "Admins can download all petitions" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'writer-petitions' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE firebase_uid = auth.uid()::text
    AND role = 'admin'
  )
);

-- 3. Verificação final: Confirmar que as políticas foram criadas corretamente
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















