-- ========================================
-- 📋 ADICIONAR COLUNAS FALTANTES EM PETITIONS
-- ========================================

-- 1️⃣ Adicionar coluna 'area' (área do direito)
ALTER TABLE petitions 
  ADD COLUMN IF NOT EXISTS area TEXT;

-- 2️⃣ Adicionar coluna 'requires_labor_calculation' (se ainda não existir)
ALTER TABLE petitions 
  ADD COLUMN IF NOT EXISTS requires_labor_calculation BOOLEAN DEFAULT false;

-- 3️⃣ Adicionar coluna 'calculation_id' (para vinculo com cálculos)
ALTER TABLE petitions 
  ADD COLUMN IF NOT EXISTS calculation_id UUID REFERENCES labor_calculations(id) ON DELETE SET NULL;

-- 4️⃣ Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_petitions_area ON petitions(area);
CREATE INDEX IF NOT EXISTS idx_petitions_requires_calc ON petitions(requires_labor_calculation);
CREATE INDEX IF NOT EXISTS idx_petitions_calculation_id ON petitions(calculation_id);

-- 5️⃣ Comentários
COMMENT ON COLUMN petitions.area IS 'Área do direito relacionada à petição';
COMMENT ON COLUMN petitions.requires_labor_calculation IS 'Indica se a petição necessita de cálculo trabalhista';
COMMENT ON COLUMN petitions.calculation_id IS 'ID do cálculo trabalhista vinculado';

-- 6️⃣ Verificar se foram criadas
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'petitions' 
  AND column_name IN ('area', 'requires_labor_calculation', 'calculation_id')
ORDER BY column_name;

