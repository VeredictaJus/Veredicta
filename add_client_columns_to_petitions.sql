-- Adicionar colunas client_name e client_location à tabela petitions
-- Estas colunas serão populadas com dados do user_profiles

-- Adicionar colunas
ALTER TABLE petitions 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_location TEXT;

-- Criar trigger para popular automaticamente estas colunas ao inserir/atualizar
CREATE OR REPLACE FUNCTION populate_client_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Buscar nome e localização do cliente em user_profiles
  SELECT 
    COALESCE(up.full_name, 'Cliente'),
    COALESCE(up.address, 'Não informado')
  INTO 
    NEW.client_name,
    NEW.client_location
  FROM user_profiles up
  WHERE up.firebase_uid = NEW.client_id
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger se já existir
DROP TRIGGER IF EXISTS trigger_populate_client_info ON petitions;

-- Criar trigger
CREATE TRIGGER trigger_populate_client_info
BEFORE INSERT OR UPDATE ON petitions
FOR EACH ROW
EXECUTE FUNCTION populate_client_info();

-- Atualizar registros existentes
UPDATE petitions p
SET 
  client_name = COALESCE(up.full_name, 'Cliente'),
  client_location = COALESCE(up.address, 'Não informado')
FROM user_profiles up
WHERE up.firebase_uid = p.client_id;

-- Comentários
COMMENT ON COLUMN petitions.client_name IS 'Nome do cliente obtido automaticamente do user_profiles';
COMMENT ON COLUMN petitions.client_location IS 'Localização do cliente obtida automaticamente do user_profiles';

