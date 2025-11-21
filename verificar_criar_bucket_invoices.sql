-- Script para verificar e criar o bucket 'invoices' no Supabase Storage

-- 1. Verificar se o bucket existe
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE name = 'invoices';

-- 2. Se não existir, criar o bucket 'invoices'
-- Execute este INSERT apenas se o SELECT acima não retornar nenhuma linha

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false, -- false = privado (requer autenticação)
  52428800, -- 50MB em bytes
  ARRAY['application/pdf']::text[] -- Apenas PDFs
)
ON CONFLICT (id) DO NOTHING;

-- 3. Criar políticas RLS para o bucket invoices

-- Política: Writers podem fazer upload de suas próprias notas fiscais
CREATE POLICY "Writers can upload their own invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Writers podem ler suas próprias notas fiscais
CREATE POLICY "Writers can read their own invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Writers podem atualizar suas próprias notas fiscais
CREATE POLICY "Writers can update their own invoices"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Writers podem deletar suas próprias notas fiscais
CREATE POLICY "Writers can delete their own invoices"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Admins podem ver todas as notas fiscais
CREATE POLICY "Admins can view all invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 4. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%invoice%'
ORDER BY policyname;

-- 5. Verificar bucket após criação
SELECT 
  'Bucket invoices criado com sucesso!' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'invoices';












