-- Script para permitir LIST de notas fiscais no bucket invoices
-- Problema: Upload funciona (via Edge Function), mas LIST falha (cliente não tem permissão)
-- Solução: Permitir acesso público de leitura/listagem no bucket invoices

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Public access for invoices bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload invoices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read invoices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all invoices" ON storage.objects;

-- 2. Criar políticas públicas para permitir leitura/listagem
-- A segurança no upload é garantida pela Edge Function

-- Permitir SELECT (list e download) publicamente
CREATE POLICY "Public read access for invoices"
ON storage.objects
FOR SELECT
USING (bucket_id = 'invoices');

-- Permitir INSERT apenas via Service Role (Edge Function)
-- Não criamos política de INSERT aqui, então apenas Service Role Key pode fazer upload

-- 3. Verificar políticas criadas
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
  AND schemaname = 'storage'
ORDER BY policyname;

-- 4. Verificar configuração do bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE name = 'invoices';

-- 5. Testar listagem (deve funcionar agora)
SELECT 
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'invoices'
ORDER BY created_at DESC
LIMIT 5;










