-- Atualizar títulos das conversas para mostrar nome do cliente em vez de "Petição: ..."
-- Este script corrige conversas já existentes

-- Atualizar conversas do tipo 'petition' para usar o nome do cliente
UPDATE conversations
SET title = COALESCE(
  (
    SELECT p.client_name
    FROM petitions p
    WHERE p.client_id IN (
      SELECT cp.user_id 
      FROM conversation_participants cp 
      WHERE cp.conversation_id = conversations.id
      AND cp.role = 'client'
      LIMIT 1
    )
    LIMIT 1
  ),
  'Cliente'
)
WHERE type = 'petition'
AND title LIKE 'Petição:%';

-- Verificar resultado
SELECT 
  c.id,
  c.title AS novo_titulo,
  c.type,
  c.status,
  c.created_at
FROM conversations c
WHERE c.type = 'petition'
ORDER BY c.created_at DESC
LIMIT 10;









