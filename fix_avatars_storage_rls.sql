-- Corrigir políticas RLS do bucket 'avatars' para permitir upload de fotos de perfil
-- Erro: "new row violates row-level security policy"

-- 1. Verificar se o bucket 'avatars' existe
SELECT id, name, public
FROM storage.buckets
WHERE name = 'avatars';

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public avatars are viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

-- 3. Criar política para UPLOAD (INSERT)
CREATE POLICY "Authenticated users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  -- Permitir que o usuário faça upload apenas em sua própria pasta (firebase_uid)
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Criar política para UPDATE
CREATE POLICY "Authenticated users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Criar política para SELECT (visualização)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 6. Criar política para DELETE
CREATE POLICY "Authenticated users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. Garantir que o bucket seja público para leitura
UPDATE storage.buckets
SET public = true
WHERE name = 'avatars';

-- 8. Verificar políticas criadas
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
  AND policyname LIKE '%avatar%'
ORDER BY policyname;









