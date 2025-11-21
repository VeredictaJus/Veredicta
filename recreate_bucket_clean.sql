-- RECRIAR BUCKET WRITER-PETITIONS LIMPO
-- 1. Verificar arquivos existentes
SELECT COUNT(*) as total_files
FROM storage.objects
WHERE bucket_id = 'writer-petitions';

-- 2. Deletar todos os arquivos do bucket
DELETE FROM storage.objects
WHERE bucket_id = 'writer-petitions';

-- 3. Deletar o bucket existente
DELETE FROM storage.buckets 
WHERE name = 'writer-petitions';

-- 4. Criar o bucket novamente com configuração correta
INSERT INTO storage.buckets (
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types, 
  created_at, 
  updated_at
)
VALUES (
  'writer-petitions', 
  'writer-petitions', 
  false, 
  52428800, -- 50MB
  ARRAY['application/pdf'], 
  NOW(), 
  NOW()
);

-- 5. Verificar se foi criado corretamente
SELECT
  name,
  allowed_mime_types,
  file_size_limit,
  public,
  created_at,
  updated_at
FROM storage.buckets
WHERE name = 'writer-petitions';

-- 6. Verificar se não há mais arquivos
SELECT COUNT(*) as total_files_after
FROM storage.objects
WHERE bucket_id = 'writer-petitions';















