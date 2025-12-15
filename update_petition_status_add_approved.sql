-- Atualizar constraint de status para incluir 'approved'
-- Este status indica que o cliente confirmou o recebimento sem necessidade de correções

-- Remover constraint antiga
ALTER TABLE petitions 
DROP CONSTRAINT IF EXISTS petitions_status_check;

-- Adicionar nova constraint com o status 'approved'
ALTER TABLE petitions 
ADD CONSTRAINT petitions_status_check 
CHECK (status IN (
  'pending',       -- Aguardando atribuição
  'available',     -- Disponível para redatores
  'assigned',      -- Atribuída a um redator
  'in_progress',   -- Em andamento
  'pending_review',-- Aguardando revisão
  'revision',      -- Em revisão
  'delivered',     -- Entregue pelo redator
  'approved',      -- ✅ NOVO: Aprovada pelo cliente (sem correções)
  'completed',     -- Concluída
  'cancelled'      -- Cancelada
));

-- Comentário atualizado
COMMENT ON CONSTRAINT petitions_status_check ON petitions IS 'Status permitidos: pending, available, assigned, in_progress, pending_review, revision, delivered, approved, completed, cancelled';

-- Comentário na coluna
COMMENT ON COLUMN petitions.status IS 'Status da petição. "approved" indica que o cliente confirmou o recebimento sem necessidade de correções.';

-- Verificar se já existe alguma petição com status 'approved'
SELECT COUNT(*) as total_approved
FROM petitions
WHERE status = 'approved';

-- Verificar todos os status possíveis
SELECT DISTINCT status, COUNT(*) as total
FROM petitions
GROUP BY status
ORDER BY status;









