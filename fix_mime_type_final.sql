-- SOLUÇÃO FINAL: Corrigir o MIME type do bucket writer-petitions
-- O problema é que está como "application/pd" em vez de "application/pdf"

-- 1. Primeiro, vamos verificar o estado atual
SELECT 
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets 
WHERE name = 'writer-petitions';

-- 2. Tentar atualizar usando diferentes abordagens
-- Abordagem 1: UPDATE direto
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['application/pdf'],
  updated_at = NOW()
WHERE name = 'writer-petitions';

-- 3. Se não funcionar, vamos tentar recriar o bucket
-- Primeiro, vamos verificar se há arquivos no bucket
SELECT COUNT(*) as total_files
FROM storage.objects 
WHERE bucket_id = 'writer-petitions';

-- 4. Se não houver arquivos, podemos recriar o bucket
-- (Execute apenas se o COUNT for 0)
-- DELETE FROM storage.buckets WHERE name = 'writer-petitions';
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
-- VALUES ('writer-petitions', 'writer-petitions', false, 52428800, ARRAY['application/pdf'], NOW(), NOW());

-- 5. Verificar se a correção funcionou
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

-- 6. Se ainda não funcionar, vamos tentar uma abordagem diferente
-- Atualizar usando uma string JSON válida
UPDATE storage.buckets 
SET 
  allowed_mime_types = '["application/pdf"]'::jsonb,
  updated_at = NOW()
WHERE name = 'writer-petitions';

-- 7. Verificação final
SELECT 
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets 
WHERE name = 'writer-petitions';















