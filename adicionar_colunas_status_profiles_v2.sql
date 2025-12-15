-- ===============================================
-- SCRIPT: Adicionar colunas de status e verificação
-- ===============================================
-- Este script adiciona as colunas necessárias para gerenciar
-- status e verificação de usuários na tabela profiles_v2
-- ===============================================

-- 1. Adicionar coluna de status
ALTER TABLE profiles_v2
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. Adicionar coluna de verificação
ALTER TABLE profiles_v2
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_v2_status
ON profiles_v2(status);

CREATE INDEX IF NOT EXISTS idx_profiles_v2_verification
ON profiles_v2(verification_status);

-- 4. Comentários nas colunas (documentação)
COMMENT ON COLUMN profiles_v2.status IS 'Status da conta: active, pending, suspended, blocked';
COMMENT ON COLUMN profiles_v2.verification_status IS 'Status de verificação: verified, pending, rejected';

-- 5. Atualizar usuários existentes (opcional)
-- Todos os usuários existentes ficarão como 'active' e 'pending' por padrão
-- Se quiser que admins já sejam verificados automaticamente:
UPDATE profiles_v2
SET verification_status = 'verified'
WHERE role = 'admin' AND verification_status = 'pending';

-- ===============================================
-- VERIFICAÇÃO
-- ===============================================
-- Execute este comando para confirmar que as colunas foram criadas:
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles_v2' 
  AND column_name IN ('status', 'verification_status')
ORDER BY column_name;

-- ===============================================
-- RESULTADO ESPERADO
-- ===============================================
-- Você deve ver 2 colunas:
-- 1. status (text, default: 'active'::text)
-- 2. verification_status (text, default: 'pending'::text)
-- ===============================================














