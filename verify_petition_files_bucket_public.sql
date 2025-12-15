-- Verificar se o bucket petition_files está público
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'petition_files';

-- ✅ Resultado esperado: public = true

