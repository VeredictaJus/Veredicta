-- Adicionar colunas de perfil profissional do redator à tabela profiles_v2
-- Estas colunas são necessárias para salvar: telefone, OAB, cidade, estado, etc.

-- 1. Adicionar colunas básicas de contato
ALTER TABLE profiles_v2 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- 2. Adicionar colunas específicas de redator/advogado
ALTER TABLE profiles_v2 
ADD COLUMN IF NOT EXISTS oab_number TEXT,
ADD COLUMN IF NOT EXISTS oab_state TEXT DEFAULT 'SP',
ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'full_time';

-- 3. Adicionar colunas de dados bancários
ALTER TABLE profiles_v2 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_agency TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS pix_key TEXT;

-- 4. Adicionar colunas de estatísticas
ALTER TABLE profiles_v2 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_petitions INTEGER DEFAULT 0;

-- 5. Comentários nas colunas
COMMENT ON COLUMN profiles_v2.phone IS 'Telefone do usuário';
COMMENT ON COLUMN profiles_v2.city IS 'Cidade do usuário';
COMMENT ON COLUMN profiles_v2.state IS 'Estado (UF) do usuário';
COMMENT ON COLUMN profiles_v2.oab_number IS 'Número da OAB (para advogados/redatores)';
COMMENT ON COLUMN profiles_v2.oab_state IS 'Estado da OAB';
COMMENT ON COLUMN profiles_v2.specialties IS 'Especialidades do redator (JSON array)';
COMMENT ON COLUMN profiles_v2.experience_years IS 'Anos de experiência';
COMMENT ON COLUMN profiles_v2.bio IS 'Biografia/descrição profissional';
COMMENT ON COLUMN profiles_v2.hourly_rate IS 'Taxa por hora (R$)';
COMMENT ON COLUMN profiles_v2.availability IS 'Disponibilidade: full_time, part_time, freelance';
COMMENT ON COLUMN profiles_v2.bank_name IS 'Nome do banco';
COMMENT ON COLUMN profiles_v2.bank_agency IS 'Agência bancária';
COMMENT ON COLUMN profiles_v2.bank_account IS 'Conta bancária';
COMMENT ON COLUMN profiles_v2.pix_key IS 'Chave PIX';
COMMENT ON COLUMN profiles_v2.rating IS 'Avaliação média (0-5)';
COMMENT ON COLUMN profiles_v2.completed_petitions IS 'Total de petições concluídas';

-- 6. Criar índices para melhorar performance de buscas
CREATE INDEX IF NOT EXISTS idx_profiles_v2_oab ON profiles_v2(oab_number);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_city_state ON profiles_v2(city, state);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_specialties ON profiles_v2 USING gin(specialties);

-- 7. Verificar estrutura atualizada
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles_v2'
ORDER BY ordinal_position;









