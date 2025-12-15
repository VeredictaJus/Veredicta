-- CORREÇÃO DEFINITIVA DO MIME TYPE - FORÇA BRUTA
-- 1. Verificar estado atual
SELECT
  name,
  allowed_mime_types,
  updated_at
FROM storage.buckets
WHERE name = 'writer-petitions';

-- 2. Tentar diferentes abordagens de correção
-- Abordagem 1: UPDATE direto com ARRAY
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

-- 4. Se ainda não funcionar, tentar com string literal
UPDATE storage.buckets
SET
  allowed_mime_types = '{application/pdf}',
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















