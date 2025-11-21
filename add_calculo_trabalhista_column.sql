-- ============================================
-- ADICIONAR COLUNA DE CÁLCULO TRABALHISTA
-- ============================================
-- Este script adiciona uma coluna para indicar se a petição
-- requer cálculo trabalhista (verbas rescisórias, horas extras, etc.)

-- 1. Adicionar coluna para indicar necessidade de cálculo trabalhista
ALTER TABLE app_2d8133c678_petitions 
ADD COLUMN IF NOT EXISTS requires_labor_calculation BOOLEAN DEFAULT false;

-- 2. Adicionar comentário na coluna
COMMENT ON COLUMN app_2d8133c678_petitions.requires_labor_calculation 
IS 'Indica se a petição requer cálculo trabalhista (verbas rescisórias, horas extras, diferenças salariais, FGTS, etc.)';

-- 3. Criar índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_petitions_labor_calculation 
ON app_2d8133c678_petitions(requires_labor_calculation);

-- ============================================
-- VERIFICAÇÕES
-- ============================================

-- 4. Verificar que a coluna foi criada
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  col_description('app_2d8133c678_petitions'::regclass, ordinal_position) as description
FROM information_schema.columns
WHERE table_name = 'app_2d8133c678_petitions' 
  AND column_name = 'requires_labor_calculation';

-- 5. Verificar estatísticas da nova coluna
SELECT 
  requires_labor_calculation,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM app_2d8133c678_petitions
GROUP BY requires_labor_calculation;

-- ============================================
-- EXEMPLOS DE CONSULTA
-- ============================================

-- Listar petições que requerem cálculo trabalhista
-- SELECT id, title, type, requires_labor_calculation, created_at
-- FROM app_2d8133c678_petitions
-- WHERE requires_labor_calculation = true
-- ORDER BY created_at DESC;

-- Contar petições por necessidade de cálculo
-- SELECT 
--   requires_labor_calculation,
--   COUNT(*) as total
-- FROM app_2d8133c678_petitions
-- GROUP BY requires_labor_calculation;

-- ============================================
-- SUCESSO! ✅
-- ============================================
-- Coluna 'requires_labor_calculation' criada com sucesso!
-- Agora atualize o frontend (NewPetition.tsx)










