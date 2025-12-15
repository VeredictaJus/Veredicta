-- FORÇAR CORREÇÃO DO MIME TYPE
-- 1. Verificar estado atual
SELECT
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets
WHERE name = 'writer-petitions';

-- 2. Tentar diferentes abordagens de correção
-- Abordagem 1: UPDATE direto
UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY['application/pdf'],
  updated_at = NOW()
WHERE name = 'writer-petitions';

-- 3. Verificar se funcionou
SELECT
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets
WHERE name = 'writer-petitions';

-- 4. Se ainda não funcionar, tentar recriar o bucket
-- Primeiro verificar se há arquivos
SELECT COUNT(*) as total_files
FROM storage.objects
WHERE bucket_id = 'writer-petitions';

-- Se total_files = 0, podemos recriar o bucket
-- ATENÇÃO: ISSO VAI DELETAR O BUCKET E TODOS OS SEUS ARQUIVOS!
-- DELETE FROM storage.buckets WHERE name = 'writer-petitions';
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
-- VALUES ('writer-petitions', 'writer-petitions', false, 52428800, ARRAY['application/pdf'], NOW(), NOW());















