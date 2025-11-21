-- Solução temporária: Política mais permissiva para testar upload
-- Execute este script no Supabase SQL Editor

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Writers can upload their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can view their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can update their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Writers can delete their own petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all petitions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can download all petitions" ON storage.objects;

-- 2. Criar política temporária mais permissiva para o bucket writer-petitions
-- ATENÇÃO: Esta é uma política temporária para teste - deve ser ajustada depois
CREATE POLICY "Temporary writer petitions policy" ON storage.objects
FOR ALL USING (
  bucket_id = 'writer-petitions'
);

-- 3. Verificar se a política foi criada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%petitions%';















