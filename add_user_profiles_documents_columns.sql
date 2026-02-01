-- Adiciona colunas necessárias em user_profiles para:
-- - armazenar caminhos dos uploads de redator (petições autorais) e carteirinha OAB
-- - suportar fluxo de aprovação no admin (verification_status)
--
-- Execute no Supabase SQL Editor.

-- 1) Colunas para armazenar caminhos (JSON) dos arquivos no Storage
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS petition_files JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS oab_documents JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN user_profiles.petition_files IS 'Mapa (JSON) com caminhos no bucket writer-petitions: petition1/petition2/petition3';
COMMENT ON COLUMN user_profiles.oab_documents IS 'Mapa (JSON) com caminhos no bucket oab-documents: oab_front/oab_back';

-- 2) Coluna de verificação (o admin atualiza ao aprovar)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

COMMENT ON COLUMN user_profiles.verification_status IS 'Status de verificação: verified, pending, rejected';

-- 3) Verificação rápida
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN ('petition_files', 'oab_documents', 'verification_status')
ORDER BY column_name;





