-- ========================================
-- 📊 TABELA: CÁLCULOS TRABALHISTAS SALVOS
-- ========================================
-- Permite que usuários salvem cálculos trabalhistas para edição posterior

-- 1️⃣ CRIAR TABELA DE CÁLCULOS
CREATE TABLE IF NOT EXISTS labor_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  user_id TEXT NOT NULL, -- Firebase UID do usuário
  title TEXT NOT NULL DEFAULT 'Cálculo Trabalhista',
  description TEXT,
  
  -- Dados do cálculo (JSON completo)
  calculation_data JSONB NOT NULL, -- LaborCalculatorData
  calculation_result JSONB, -- CalculationResult (opcional)
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Status
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  
  -- Relacionamentos (opcional - pode ser vinculado a uma petição)
  petition_id UUID REFERENCES petitions(id) ON DELETE SET NULL
);

-- 2️⃣ CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_labor_calculations_user_id ON labor_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_labor_calculations_created_at ON labor_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_labor_calculations_updated_at ON labor_calculations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_labor_calculations_petition_id ON labor_calculations(petition_id);
CREATE INDEX IF NOT EXISTS idx_labor_calculations_is_favorite ON labor_calculations(is_favorite);
CREATE INDEX IF NOT EXISTS idx_labor_calculations_tags ON labor_calculations USING GIN(tags);

-- 3️⃣ HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE labor_calculations ENABLE ROW LEVEL SECURITY;

-- 4️⃣ POLÍTICAS RLS
-- Usuários podem ver apenas seus próprios cálculos
CREATE POLICY "Users can view their own calculations" ON labor_calculations
  FOR SELECT
  USING (
    user_id = auth.uid()::text OR 
    user_id IN (SELECT firebase_uid FROM user_profiles WHERE id = auth.uid())
  );

-- Usuários podem inserir seus próprios cálculos
CREATE POLICY "Users can insert their own calculations" ON labor_calculations
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()::text OR 
    user_id IN (SELECT firebase_uid FROM user_profiles WHERE id = auth.uid())
  );

-- Usuários podem atualizar seus próprios cálculos
CREATE POLICY "Users can update their own calculations" ON labor_calculations
  FOR UPDATE
  USING (
    user_id = auth.uid()::text OR 
    user_id IN (SELECT firebase_uid FROM user_profiles WHERE id = auth.uid())
  );

-- Usuários podem deletar seus próprios cálculos
CREATE POLICY "Users can delete their own calculations" ON labor_calculations
  FOR DELETE
  USING (
    user_id = auth.uid()::text OR 
    user_id IN (SELECT firebase_uid FROM user_profiles WHERE id = auth.uid())
  );

-- 5️⃣ FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_labor_calculations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6️⃣ TRIGGER PARA ATUALIZAR updated_at
DROP TRIGGER IF EXISTS trigger_update_labor_calculations_updated_at ON labor_calculations;
CREATE TRIGGER trigger_update_labor_calculations_updated_at
  BEFORE UPDATE ON labor_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_labor_calculations_updated_at();

-- 7️⃣ COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE labor_calculations IS 'Armazena cálculos trabalhistas salvos pelos usuários';
COMMENT ON COLUMN labor_calculations.user_id IS 'Firebase UID do usuário que criou o cálculo';
COMMENT ON COLUMN labor_calculations.title IS 'Título do cálculo (ex: Nome do cliente)';
COMMENT ON COLUMN labor_calculations.calculation_data IS 'Dados completos do cálculo (LaborCalculatorData em JSON)';
COMMENT ON COLUMN labor_calculations.calculation_result IS 'Resultado do cálculo (CalculationResult em JSON)';
COMMENT ON COLUMN labor_calculations.petition_id IS 'ID da petição associada (se houver)';
COMMENT ON COLUMN labor_calculations.is_favorite IS 'Marca cálculo como favorito';
COMMENT ON COLUMN labor_calculations.tags IS 'Tags para organização (ex: cliente, área, etc)';

-- ✅ SCRIPT CONCLUÍDO
-- Execute este script no Supabase SQL Editor









