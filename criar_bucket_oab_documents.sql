-- ============================================
-- 🔒 CONFIGURAÇÃO FINAL DO BUCKET OAB-DOCUMENTS
-- ============================================
-- Este bucket armazena carteirinhas OAB de clientes e redatores
-- SOLUÇÃO: Bucket PRIVADO + Service Role Key (bypassa RLS)

-- ============================================
-- 🎯 PASSO 1: TORNAR BUCKET PRIVADO
-- ============================================

-- Tornar bucket PRIVADO (importante para segurança!)
UPDATE storage.buckets
SET public = false
WHERE id = 'oab-documents';

-- Verificar se está privado
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'oab-documents';

-- ✅ Resultado esperado: public = false

-- ============================================
-- 📋 COMO FUNCIONA AGORA
-- ============================================

-- ✅ Bucket: PRIVADO (public = false)
-- ✅ Upload: Via Service Role Key no código (bypassa RLS)
-- ✅ Acesso: Apenas admins via Supabase Dashboard
-- ✅ URLs: Privadas (não acessíveis publicamente)

-- ============================================
-- 🔐 SEGURANÇA
-- ============================================

-- 1. O bucket está PRIVADO
-- 2. O código Register.tsx usa Service Role Key
-- 3. Service Role Key BYPASSA RLS automaticamente
-- 4. Não precisa de políticas RLS complexas
-- 5. Compatível com Firebase Auth + Supabase Storage

-- ============================================
-- 🚀 O QUE FOI FEITO
-- ============================================

-- Backend (Register.tsx):
--   - Usa createClient() com Service Role Key
--   - Bypassa RLS automaticamente
--   - Upload seguro para bucket privado

-- Supabase (este script):
--   - Bucket configurado como PRIVADO
--   - Sem necessidade de políticas RLS
--   - Service Role Key tem acesso total

-- ============================================
-- 📂 ESTRUTURA DE PASTAS NO BUCKET
-- ============================================

-- oab-documents/
-- ├── {firebase_uid_cliente1}/
-- │   ├── oab_front_1234567890.jpg
-- │   └── oab_back_1234567890.jpg
-- ├── {firebase_uid_cliente2}/
-- │   ├── oab_front_1234567891.pdf
-- │   └── oab_back_1234567891.pdf
-- └── {firebase_uid_redator}/
--     ├── oab_front_1234567892.jpg
--     └── oab_back_1234567892.jpg

-- ============================================
-- ⚙️ CONFIGURAÇÃO DO BUCKET (se ainda não existe)
-- ============================================

-- Se o bucket não existe, crie via Supabase Dashboard:
-- 1. Storage > New Bucket
-- 2. Nome: oab-documents
-- 3. Public: NÃO (desmarque)
-- 4. File size limit: 5242880 (5MB)
-- 5. Allowed MIME types: image/jpeg,image/png,application/pdf

-- Ou via SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'oab-documents',
  'oab-documents',
  FALSE, -- PRIVADO!
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = false, -- GARANTIR QUE ESTÁ PRIVADO
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 🔍 VERIFICAR CONFIGURAÇÃO
-- ============================================

SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'oab-documents';

-- Resultado esperado:
-- id: oab-documents
-- name: oab-documents
-- public: false ✅
-- file_size_limit: 5242880 (5MB)
-- allowed_mime_types: {image/jpeg, image/jpg, image/png, application/pdf}

-- ============================================
-- ✅ PRONTO!
-- ============================================
-- Execute o SQL acima no Supabase SQL Editor
-- O bucket estará PRIVADO e seguro
-- O código já está usando Service Role Key
