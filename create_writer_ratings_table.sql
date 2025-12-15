-- ========================================
-- 📊 TABELA DE AVALIAÇÕES DE REDATORES
-- ========================================
-- Compatível com Firebase Auth (TEXT IDs)

-- Remover view existente se houver (para criar como tabela)
DROP VIEW IF EXISTS app_2d8133c678_writer_ratings CASCADE;

-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS app_2d8133c678_writer_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  writer_id TEXT NOT NULL, -- Firebase UID do redator
  client_id TEXT NOT NULL, -- Firebase UID do cliente
  petition_id UUID REFERENCES petitions(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Uma avaliação por petição (evita duplicatas)
  CONSTRAINT unique_client_petition_rating UNIQUE(client_id, petition_id)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_writer_ratings_writer ON app_2d8133c678_writer_ratings(writer_id);
CREATE INDEX IF NOT EXISTS idx_writer_ratings_client ON app_2d8133c678_writer_ratings(client_id);
CREATE INDEX IF NOT EXISTS idx_writer_ratings_petition ON app_2d8133c678_writer_ratings(petition_id);
CREATE INDEX IF NOT EXISTS idx_writer_ratings_created_at ON app_2d8133c678_writer_ratings(created_at DESC);

-- Comentários
COMMENT ON TABLE app_2d8133c678_writer_ratings IS 'Avaliações dos redatores pelos clientes';
COMMENT ON COLUMN app_2d8133c678_writer_ratings.writer_id IS 'Firebase UID do redator avaliado';
COMMENT ON COLUMN app_2d8133c678_writer_ratings.client_id IS 'Firebase UID do cliente que avaliou';
COMMENT ON COLUMN app_2d8133c678_writer_ratings.rating IS 'Nota de 1 a 5 estrelas';
COMMENT ON COLUMN app_2d8133c678_writer_ratings.comment IS 'Comentário opcional do cliente';

-- Habilitar RLS
ALTER TABLE app_2d8133c678_writer_ratings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Clientes podem inserir avaliações para petições aprovadas
CREATE POLICY "Clients can insert ratings for approved petitions" 
ON app_2d8133c678_writer_ratings
FOR INSERT 
WITH CHECK (
  client_id IN (SELECT firebase_uid FROM profiles_v2 WHERE firebase_uid = client_id)
  AND EXISTS (
    SELECT 1 FROM petitions 
    WHERE id = petition_id 
    AND client_id = app_2d8133c678_writer_ratings.client_id
    AND status IN ('approved', 'delivered')
  )
);

-- Redatores podem ver suas próprias avaliações
CREATE POLICY "Writers can view their own ratings" 
ON app_2d8133c678_writer_ratings
FOR SELECT 
USING (
  writer_id IN (SELECT firebase_uid FROM profiles_v2 WHERE firebase_uid = writer_id)
);

-- Clientes podem ver avaliações que fizeram
CREATE POLICY "Clients can view ratings they submitted" 
ON app_2d8133c678_writer_ratings
FOR SELECT 
USING (
  client_id IN (SELECT firebase_uid FROM profiles_v2 WHERE firebase_uid = client_id)
);

-- Admins podem ver todas as avaliações
CREATE POLICY "Admins can view all ratings" 
ON app_2d8133c678_writer_ratings
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role = 'admin'
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_writer_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_writer_ratings_updated_at
  BEFORE UPDATE ON app_2d8133c678_writer_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_writer_ratings_updated_at();

