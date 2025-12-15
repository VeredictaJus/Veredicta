-- Corrigir status da conversa de 'archived' para 'active'
-- A conversa não deveria estar arquivada ao ser criada

-- Atualizar a conversa específica
UPDATE conversations
SET status = 'active'
WHERE type = 'petition'
AND status = 'archived';

-- Verificar resultado
SELECT 
  c.id,
  c.title,
  c.type,
  c.status,
  c.created_at,
  c.updated_at
FROM conversations c
WHERE c.type = 'petition'
ORDER BY c.created_at DESC
LIMIT 10;









