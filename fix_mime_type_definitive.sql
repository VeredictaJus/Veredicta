-- SOLUÇÃO DEFINITIVA: Corrigir o MIME type do bucket writer-petitions
-- O problema é que está como "application/pd" em vez de "application/pdf"

-- 1. Verificar o estado atual
SELECT 
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets 
WHERE name = 'writer-petitions';

-- 2. Tentar diferentes abordagens de UPDATE
-- Abordagem 1: Usar string literal
UPDATE storage.buckets 
SET 
  allowed_mime_types = '{application/pdf}',
  updated_at = NOW()
WHERE name = 'writer-petitions';

-- 3. Verificar se funcionou
SELECT 
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets 
WHERE name = 'writer-petitions';

-- 4. Se não funcionar, tentar com ARRAY explícito
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['application/pdf']::text[],
  updated_at = NOW()
WHERE name = 'writer-petitions';

-- 5. Verificar novamente
SELECT 
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets 
WHERE name = 'writer-petitions';

-- 6. Se ainda não funcionar, tentar com CAST explícito
UPDATE storage.buckets 
SET 
  allowed_mime_types = '{"application/pdf"}'::text[],
  updated_at = NOW()
WHERE name = 'writer-petitions';

-- 7. Verificação final
SELECT 
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets 
WHERE name = 'writer-petitions';

-- 8. Se NADA funcionar, vamos tentar uma abordagem diferente
-- Verificar o tipo exato da coluna
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'buckets' 
AND column_name = 'allowed_mime_types';

-- 9. Tentar atualizar usando o tipo correto baseado no schema
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['application/pdf'],
  updated_at = NOW()
WHERE name = 'writer-petitions';

-- 10. Verificação final definitiva
SELECT 
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets 
WHERE name = 'writer-petitions';















