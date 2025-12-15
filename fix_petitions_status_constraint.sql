-- Corrigir constraint de status da tabela petitions
-- Adicionar status faltantes: 'assigned', 'available', 'delivered', 'cancelled'

-- Remover constraint antiga
ALTER TABLE petitions 
DROP CONSTRAINT IF EXISTS petitions_status_check;

-- Adicionar nova constraint com todos os status
ALTER TABLE petitions 
ADD CONSTRAINT petitions_status_check 
CHECK (status IN (
  'pending',       -- Aguardando atribuição
  'available',     -- Disponível para redatores
  'assigned',      -- Atribuída a um redator
  'in_progress',   -- Em andamento
  'revision',      -- Em revisão
  'completed',     -- Concluída
  'rejected',      -- Rejeitada
  'delivered',     -- Entregue ao cliente
  'cancelled'      -- Cancelada
));

-- Comentário
COMMENT ON CONSTRAINT petitions_status_check ON petitions IS 'Status permitidos: pending, available, assigned, in_progress, revision, completed, rejected, delivered, cancelled';









