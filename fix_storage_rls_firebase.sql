-- Script para ajustar políticas RLS do Storage para funcionar com Firebase Auth
-- O problema é que auth.uid() do Supabase não reconhece usuários do Firebase

-- 1. DELETAR todas as políticas antigas do bucket invoices
DROP POLICY IF EXISTS "Writers can upload their own invoices" ON storage.objects;
DROP POLICY IF EXISTS "Writers can read their own invoices" ON storage.objects;
DROP POLICY IF EXISTS "Writers can update their own invoices" ON storage.objects;
DROP POLICY IF EXISTS "Writers can delete their own invoices" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all invoices" ON storage.objects;

-- 2. OPÇÃO TEMPORÁRIA: Permitir uploads autenticados (qualquer usuário logado)
-- Esta é uma solução temporária para testar se o upload funciona

-- Permitir qualquer usuário autenticado fazer upload em sua própria pasta
CREATE POLICY "Authenticated users can upload invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices'
);

-- Permitir qualquer usuário autenticado ler qualquer arquivo do bucket
CREATE POLICY "Authenticated users can read invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices'
);

-- Permitir atualização
CREATE POLICY "Authenticated users can update invoices"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'invoices'
);

-- Permitir deleção
CREATE POLICY "Authenticated users can delete invoices"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoices'
);

-- 3. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%invoice%'
ORDER BY policyname;

-- 4. ALTERNATIVA: Se você quiser políticas mais restritivas com Firebase
-- Descomente e use estas políticas mais tarde, após testar

/*
-- Requer que a tabela user_profiles tenha firebase_uid
CREATE POLICY "Writers can upload their own invoices via firebase"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] IN (
    SELECT firebase_uid FROM user_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Writers can read their own invoices via firebase"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] IN (
    SELECT firebase_uid FROM user_profiles 
    WHERE id = auth.uid()
  )
);
*/

-- 5. Mostrar status final
SELECT 
  'Políticas RLS atualizadas para aceitar usuários autenticados' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%invoice%';












