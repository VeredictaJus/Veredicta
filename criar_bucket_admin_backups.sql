-- ===============================================
-- SCRIPT: Criar bucket admin-backups no Supabase
-- ===============================================
-- Este script cria um bucket separado para backups do sistema
-- executados pelo administrador da plataforma.
--
-- IMPORTANTE: 
-- 1. Primeiro crie o bucket manualmente no Supabase:
--    Storage → New bucket → Nome: "admin-backups" → Public: NÃO
-- 2. Depois execute este SQL para criar as políticas de acesso
-- ===============================================

-- Política 1: Permitir que admins façam upload de backups
CREATE POLICY "Admins can upload backups"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-backups' 
  AND EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Política 2: Permitir que admins leiam/listem backups
CREATE POLICY "Admins can read backups"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'admin-backups'
  AND EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Política 3: Permitir que admins deletem backups antigos
CREATE POLICY "Admins can delete backups"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'admin-backups'
  AND EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = auth.uid()::text 
    AND role = 'admin'
  )
);

-- ===============================================
-- VERIFICAÇÃO (OPCIONAL)
-- ===============================================
-- Execute este comando para verificar se as políticas foram criadas:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%admin%backup%';

-- ===============================================
-- RESULTADO ESPERADO
-- ===============================================
-- Você deve ver 3 políticas listadas:
-- 1. Admins can upload backups (INSERT)
-- 2. Admins can read backups (SELECT)
-- 3. Admins can delete backups (DELETE)
-- ===============================================














