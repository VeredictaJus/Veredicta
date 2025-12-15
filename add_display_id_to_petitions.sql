-- ========================================
-- 🆔 ADICIONAR DISPLAY_ID AMIGÁVEL ÀS PETIÇÕES
-- ========================================
-- Formato: PET-2025-0001, PET-2025-0002, etc.

-- 1️⃣ Adicionar coluna display_id
ALTER TABLE petitions 
ADD COLUMN IF NOT EXISTS display_id TEXT;

-- 2️⃣ Criar sequência para numeração automática (reinicia a cada ano)
CREATE SEQUENCE IF NOT EXISTS petition_number_seq START 1;

-- 3️⃣ Função para gerar display_id automaticamente
CREATE OR REPLACE FUNCTION generate_petition_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'PET-' || 
                      EXTRACT(YEAR FROM NOW())::TEXT || '-' || 
                      LPAD(nextval('petition_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4️⃣ Trigger para gerar display_id ao criar petição
DROP TRIGGER IF EXISTS trigger_generate_display_id ON petitions;
CREATE TRIGGER trigger_generate_display_id
  BEFORE INSERT ON petitions
  FOR EACH ROW
  EXECUTE FUNCTION generate_petition_display_id();

-- 5️⃣ Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_petitions_display_id ON petitions(display_id);

-- 6️⃣ Gerar display_id para petições existentes (CORRIGIDO - sem window function)
-- Usar CTE (Common Table Expression) para calcular os números
WITH numbered_petitions AS (
  SELECT 
    id,
    EXTRACT(YEAR FROM created_at)::TEXT AS year,
    ROW_NUMBER() OVER (
      PARTITION BY EXTRACT(YEAR FROM created_at) 
      ORDER BY created_at
    ) AS row_num
  FROM petitions
  WHERE display_id IS NULL
)
UPDATE petitions p
SET display_id = 'PET-' || np.year || '-' || LPAD(np.row_num::TEXT, 4, '0')
FROM numbered_petitions np
WHERE p.id = np.id;

-- 7️⃣ Adicionar comentário
COMMENT ON COLUMN petitions.display_id IS 'ID amigável para exibição (ex: PET-2025-0001)';

-- 8️⃣ Verificar resultado
SELECT 
  id,
  display_id,
  title,
  created_at
FROM petitions
ORDER BY created_at DESC
LIMIT 10;









