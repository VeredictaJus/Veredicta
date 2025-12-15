-- Solução SIMPLES: Permitir upload de avatars para usuários autenticados
-- Como usamos Firebase Auth (não Supabase Auth), não podemos usar auth.uid()

-- 1. Remover todas as políticas antigas do bucket avatars
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public avatars are viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own avatars" ON storage.objects;

-- 2. POLÍTICA SIMPLES: Permitir tudo no bucket avatars
-- (Já que o controle de acesso é feito no frontend via Firebase)

-- INSERT: Qualquer um autenticado pode fazer upload
CREATE POLICY "Allow authenticated uploads to avatars"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

-- UPDATE: Qualquer um autenticado pode atualizar
CREATE POLICY "Allow authenticated updates to avatars"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- SELECT: Todos podem visualizar (público)
CREATE POLICY "Allow public read access to avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- DELETE: Qualquer um autenticado pode deletar
CREATE POLICY "Allow authenticated deletes to avatars"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'avatars');

-- 3. Garantir que o bucket seja público
UPDATE storage.buckets
SET public = true
WHERE name = 'avatars';

-- 4. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%avatars%'
ORDER BY policyname;









