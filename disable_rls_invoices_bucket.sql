-- Script para DESABILITAR RLS no bucket invoices
-- Isso permite uploads sem autenticação do Supabase
-- Use apenas em desenvolvimento ou implemente autenticação via Edge Functions

-- 1. Remover TODAS as políticas RLS do bucket invoices
DROP POLICY IF EXISTS "Authenticated users can upload invoices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read invoices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all invoices" ON storage.objects;

-- 2. DESABILITAR RLS para storage.objects (apenas para o bucket invoices)
-- Nota: Isso não desabilita globalmente, apenas não terá políticas para invoices

-- 3. Criar política pública PERMISSIVA para o bucket invoices
-- Permite qualquer operação sem autenticação (apenas para desenvolvimento)

CREATE POLICY "Public access for invoices bucket"
ON storage.objects
FOR ALL
USING (bucket_id = 'invoices')
WITH CHECK (bucket_id = 'invoices');

-- 4. Verificar que a política foi criada
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%invoice%';

-- 5. Alternativa: Tornar o bucket público (não recomendado)
-- Se a política acima não funcionar, descomente a linha abaixo:
-- UPDATE storage.buckets SET public = true WHERE name = 'invoices';

-- 6. Verificar configuração do bucket
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'invoices';












