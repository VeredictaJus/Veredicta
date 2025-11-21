-- ========================================
-- ATUALIZAR STATUS DE PETIÇÕES ACEITAS
-- ========================================
-- 
-- Problema: Petições aceitas pelos redatores estavam sendo marcadas como 'assigned'
-- Solução: Mudar para 'in_progress' (assigned é só para atribuição manual do admin)
--

-- Atualizar petições que foram aceitas por redatores (não atribuídas manualmente)
-- Critérios:
-- 1. Status = 'assigned'
-- 2. Tem assigned_writer_id (foi aceita por um redator)
UPDATE petitions
SET 
  status = 'in_progress',
  updated_at = NOW()
WHERE 
  status = 'assigned'
  AND assigned_writer_id IS NOT NULL;

-- Verificar resultado
SELECT 
  display_id,
  title,
  status,
  assigned_writer_id,
  created_at,
  updated_at
FROM petitions
WHERE assigned_writer_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- COMENTÁRIO SOBRE A LÓGICA DE STATUS:
-- ========================================
-- 
-- ASSIGNED:
--   - Petições atribuídas MANUALMENTE pelo admin
--   - Redator não aceitou ainda, apenas foi designado
--
-- IN_PROGRESS:
--   - Petições ACEITAS por redatores de "Petições Disponíveis"
--   - Redator está trabalhando ativamente
--
-- DELIVERED:
--   - Petição entregue pelo redator
--   - Aguardando aprovação do cliente
--
-- APPROVED:
--   - Cliente aprovou a petição
--   - Trabalho concluído com sucesso
--









