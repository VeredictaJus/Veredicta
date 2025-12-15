-- Verificar o MIME type atual do bucket writer-petitions
SELECT
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets
WHERE name = 'writer-petitions';

-- Verificar o tipo da coluna
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'buckets'
AND column_name = 'allowed_mime_types';















