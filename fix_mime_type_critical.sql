-- CORREÇÃO CRÍTICA: O allowed_mime_types está como "application/pd" em vez de "application/pdf"
-- Isso está causando o erro "mime type application/json is not supported"

-- 1. Corrigir o MIME type do bucket
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['application/pdf'],
  updated_at = NOW()
WHERE name = 'writer-petitions';

-- 2. Verificar a correção
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE name = 'writer-petitions';

-- 3. Verificar se as políticas RLS estão ativas
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%writer%';















