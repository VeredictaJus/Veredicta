-- Script para permitir geração de Signed URLs no bucket invoices
-- Isso garante que os usuários possam gerar URLs temporárias para acessar as notas fiscais

-- 1. Verificar políticas atuais de SELECT para o bucket invoices
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND cmd = 'SELECT'
  AND qual LIKE '%invoices%';

-- 2. Garantir que existe uma política de SELECT pública
-- (Já criamos "Public read access for invoices" anteriormente, 
-- mas vamos confirmar que ela está ativa)

-- Se a política anterior não funcionar, descomente e execute esta:
/*
CREATE POLICY "Allow signed URL generation for invoices"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'invoices');
*/

-- 3. Verificar status final
SELECT 
  'Políticas de SELECT para invoices' as status,
  policyname,
  roles,
  permissive
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND cmd = 'SELECT'
  AND qual LIKE '%invoices%'
ORDER BY policyname;

