-- ========================================
-- CRIAR TABELA DE CORREÇÕES
-- ========================================
-- 
-- Tabela para gerenciar solicitações de correção
-- enviadas por redatores ao corretor humano (admin)
--

-- Remover tabela se existir (desenvolvimento)
DROP TABLE IF EXISTS corrections CASCADE;

-- Criar tabela
CREATE TABLE corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Firebase UID do redator que solicitou
  mode TEXT DEFAULT 'abnt', -- Modo de correção (abnt, etc)
  original_text TEXT, -- Texto original (pode ser nulo inicialmente)
  corrected_text TEXT, -- Texto corrigido (preenchido pelo corretor)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  corrector_id TEXT, -- Firebase UID do corretor que está trabalhando
  notes TEXT, -- Observações do corretor
  writer_observation TEXT, -- Observações enviadas pelo redator junto ao pedido
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE corrections IS 'Solicitações de correção enviadas por redatores';
COMMENT ON COLUMN corrections.petition_id IS 'ID da petição que precisa de correção';
COMMENT ON COLUMN corrections.user_id IS 'Firebase UID do redator que solicitou a correção';
COMMENT ON COLUMN corrections.status IS 'Status: pending (aguardando), in_progress (em correção), completed (concluída), cancelled (cancelada)';
COMMENT ON COLUMN corrections.corrector_id IS 'Firebase UID do corretor humano responsável';

-- Índices para performance
CREATE INDEX idx_corrections_petition_id ON corrections(petition_id);
CREATE INDEX idx_corrections_user_id ON corrections(user_id);
CREATE INDEX idx_corrections_status ON corrections(status);
CREATE INDEX idx_corrections_corrector_id ON corrections(corrector_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_corrections_updated_at
  BEFORE UPDATE ON corrections
  FOR EACH ROW
  EXECUTE FUNCTION update_corrections_updated_at();

-- RLS (Row Level Security)
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

-- Política: Redatores podem inserir suas próprias correções
CREATE POLICY "Redatores podem inserir correções"
  ON corrections
  FOR INSERT
  WITH CHECK (true);

-- Política: Redatores podem ver suas próprias correções
CREATE POLICY "Redatores podem ver suas correções"
  ON corrections
  FOR SELECT
  USING (true);

-- Política: Admins podem ver todas as correções
CREATE POLICY "Admins podem ver todas correções"
  ON corrections
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = user_id 
    AND role = 'admin'
  ));

-- Política: Corretores podem atualizar correções atribuídas a eles
CREATE POLICY "Corretores podem atualizar suas correções"
  ON corrections
  FOR UPDATE
  USING (
    true
  );

-- Verificar resultado
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'corrections'
ORDER BY ordinal_position;








