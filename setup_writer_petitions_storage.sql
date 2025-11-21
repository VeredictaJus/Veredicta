-- Configuração do Supabase Storage para petições de redatores
-- Este script deve ser executado no Supabase Dashboard > Storage

-- 1. Criar bucket 'writer-petitions' se não existir
-- (Execute no Supabase Dashboard > Storage > Create Bucket)
-- Nome: writer-petitions
-- Público: false (privado)
-- File size limit: 50MB (para permitir múltiplas petições de 5MB cada)
-- Allowed MIME types: application/pdf

-- 2. Configurar políticas de acesso (RLS)
-- (Execute no Supabase Dashboard > Storage > writer-petitions > Policies)

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

-- 3. Verificar se o bucket foi criado
SELECT name, id, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'writer-petitions';
