-- ============================================
-- 🔓 TORNAR BUCKET petition_files PÚBLICO
-- ============================================
-- Isso permite que os PDFs sejam abertos diretamente
-- sem necessidade de URLs assinadas

-- 1. Tornar o bucket público
UPDATE storage.buckets
SET public = true
WHERE id = 'petition_files';

-- 2. Verificar se está público
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'petition_files';

-- ✅ Resultado esperado: public = true

-- 3. Remover políticas RLS complexas (não são mais necessárias para leitura)
-- Manter apenas políticas de upload/delete para segurança

-- Política de leitura: Todos podem ler (bucket público)
DROP POLICY IF EXISTS "Allow public read access to petition_files" ON storage.objects;
CREATE POLICY "Allow public read access to petition_files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'petition_files');

-- Política de upload: Apenas autenticados podem fazer upload
DROP POLICY IF EXISTS "Allow authenticated uploads to petition_files" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to petition_files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'petition_files');

-- Política de delete: Apenas autenticados podem deletar
DROP POLICY IF EXISTS "Allow authenticated deletes to petition_files" ON storage.objects;
CREATE POLICY "Allow authenticated deletes to petition_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'petition_files');

-- 4. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%petition_files%';


