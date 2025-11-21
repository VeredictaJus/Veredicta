-- 🔧 FIX: Garantir que todas as conversas tenham os participantes corretos
-- -----------------------------------------------------------------------------
-- Este script identifica conversas que ficaram sem participantes devido ao bug
-- no front-end (participantes não eram inseridos na tabela
-- conversation_participants) e recria os vínculos necessários.
--
-- O script executa as seguintes etapas:
--   1. Adiciona o criador da conversa como participante (quando ausente)
--   2. Adiciona remetentes de mensagens que ainda não estão registrados
--   3. Para conversas de petição, adiciona cliente e redator vinculados à petição
--   4. Normaliza papéis (roles) fora do domínio esperado
--   5. Gera relatórios antes/depois para validação rápida
--
-- ⚠️ Recomendações:
--   • Execute em ambiente de staging antes de rodar em produção.
--   • Faça backup/export da tabela conversation_participants se possível.
--   • Revise os relatórios exibidos ao final para garantir que os números batem.
-- -----------------------------------------------------------------------------

BEGIN;

-- -----------------------------------------------------------------------------
-- RELATÓRIO INICIAL: Conversas sem qualquer participante cadastrado
-- -----------------------------------------------------------------------------
SELECT
  'diagnostico_inicial' AS info,
  COUNT(*) FILTER (WHERE stats.participant_count = 0) AS conversas_sem_participantes,
  COUNT(*) FILTER (WHERE stats.participant_count > 0) AS conversas_com_participantes,
  COUNT(*) AS total_conversas
FROM (
  SELECT c.id, COUNT(cp.id) AS participant_count
  FROM conversations c
  LEFT JOIN conversation_participants cp ON cp.conversation_id = c.id
  GROUP BY c.id
) stats;

-- -----------------------------------------------------------------------------
-- ETAPA 1: Garantir que o criador esteja listado como participante
-- -----------------------------------------------------------------------------
WITH creator_candidates AS (
  SELECT
    c.id AS conversation_id,
    c.created_by AS user_id,
    COALESCE(
      NULLIF(pr.role, ''),
      CASE
        WHEN c.type = 'support' THEN 'support'
        ELSE 'client'
      END
    ) AS resolved_role
  FROM conversations c
  LEFT JOIN profiles pr ON pr.firebase_uid = c.created_by::text
  WHERE c.created_by IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM conversation_participants cp
      WHERE cp.conversation_id = c.id
        AND cp.user_id = c.created_by
    )
)
, inserted_creators AS (
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  SELECT
    cc.conversation_id,
    cc.user_id,
    CASE
      WHEN cc.resolved_role IN ('client', 'writer', 'admin', 'support') THEN cc.resolved_role
      WHEN cc.resolved_role = 'lawyer' THEN 'client'
      WHEN cc.resolved_role = 'manager' THEN 'admin'
      WHEN cc.resolved_role IS NULL AND c.type = 'support' THEN 'support'
      ELSE 'client'
    END AS role
  FROM creator_candidates cc
  JOIN conversations c ON c.id = cc.conversation_id
  RETURNING conversation_id, user_id
)
SELECT
  'criadores_inseridos' AS info,
  COUNT(*) AS total
FROM inserted_creators;

-- -----------------------------------------------------------------------------
-- ETAPA 2: Garantir que remetentes de mensagens estejam cadastrados
-- -----------------------------------------------------------------------------
WITH message_candidates AS (
  SELECT
    m.conversation_id,
    m.sender_id AS user_id,
    MIN(m.created_at) AS first_message_at
  FROM messages m
  WHERE m.sender_id IS NOT NULL
    AND m.sender_id::text <> 'system'
  GROUP BY m.conversation_id, m.sender_id
), filtered_message_candidates AS (
  SELECT
    mc.conversation_id,
    mc.user_id,
    mc.first_message_at,
    COALESCE(
      NULLIF(pr.role, ''),
      CASE
        WHEN c.type = 'support' THEN 'support'
        ELSE 'client'
      END
    ) AS resolved_role
  FROM message_candidates mc
  JOIN conversations c ON c.id = mc.conversation_id
  LEFT JOIN profiles pr ON pr.firebase_uid = mc.user_id::text
  WHERE NOT EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = mc.conversation_id
      AND cp.user_id = mc.user_id
  )
)
, inserted_message_participants AS (
  INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at, last_read_at)
  SELECT
    fmc.conversation_id,
    fmc.user_id,
    CASE
      WHEN fmc.resolved_role IN ('client', 'writer', 'admin', 'support') THEN fmc.resolved_role
      WHEN fmc.resolved_role = 'lawyer' THEN 'client'
      WHEN fmc.resolved_role = 'manager' THEN 'admin'
      WHEN fmc.resolved_role IS NULL AND c.type = 'support' THEN 'support'
      ELSE 'client'
    END AS role,
    fmc.first_message_at,
    fmc.first_message_at
  FROM filtered_message_candidates fmc
  JOIN conversations c ON c.id = fmc.conversation_id
  RETURNING conversation_id, user_id
)
SELECT
  'participantes_via_mensagens' AS info,
  COUNT(*) AS total
FROM inserted_message_participants;

-- -----------------------------------------------------------------------------
-- ETAPA 3: Conversas de petição - adicionar cliente e redator vinculados
-- -----------------------------------------------------------------------------
WITH petition_conversations AS (
  SELECT
    c.id AS conversation_id,
    c.type,
    CASE
      WHEN p.client_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN p.client_id::uuid
      ELSE NULL::uuid
    END AS client_uuid,
    CASE
      WHEN p.assigned_writer_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN p.assigned_writer_id::uuid
      ELSE NULL::uuid
    END AS writer_uuid
  FROM conversations c
  JOIN petitions p ON p.id = c.petition_id
  WHERE c.petition_id IS NOT NULL
    AND c.type = 'petition'
)
, inserted_petition_clients AS (
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  SELECT
    pc.conversation_id,
    pc.client_uuid,
    'client' AS role
  FROM petition_conversations pc
  WHERE pc.client_uuid IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM conversation_participants cp
      WHERE cp.conversation_id = pc.conversation_id
        AND cp.user_id = pc.client_uuid
    )
  RETURNING conversation_id, user_id
)
, inserted_petition_writers AS (
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  SELECT
    pc.conversation_id,
    pc.writer_uuid,
    'writer' AS role
  FROM petition_conversations pc
  WHERE pc.writer_uuid IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM conversation_participants cp
      WHERE cp.conversation_id = pc.conversation_id
        AND cp.user_id = pc.writer_uuid
    )
  RETURNING conversation_id, user_id
)
SELECT
  'participantes_peticao_adicionados' AS info,
  COUNT(*) FILTER (WHERE origin = 'client') AS clientes,
  COUNT(*) FILTER (WHERE origin = 'writer') AS redatores
FROM (
  SELECT 'client' AS origin FROM inserted_petition_clients
  UNION ALL
  SELECT 'writer' AS origin FROM inserted_petition_writers
) s;

-- -----------------------------------------------------------------------------
-- ETAPA 4: Normalizar papéis fora do domínio esperado
-- -----------------------------------------------------------------------------
UPDATE conversation_participants
SET role = CASE
    WHEN role IS NULL OR role = '' THEN 'client'
    WHEN role = 'lawyer' THEN 'client'
    WHEN role = 'manager' THEN 'admin'
    WHEN role NOT IN ('client', 'writer', 'admin', 'support') THEN 'client'
    ELSE role
  END
WHERE role IS NULL
   OR role = ''
   OR role NOT IN ('client', 'writer', 'admin', 'support', 'lawyer', 'manager');

-- -----------------------------------------------------------------------------
-- RELATÓRIO FINAL: Conversas com/sem participantes após correção
-- -----------------------------------------------------------------------------
SELECT
  'diagnostico_final' AS info,
  COUNT(*) FILTER (WHERE stats.participant_count = 0) AS conversas_sem_participantes,
  COUNT(*) FILTER (WHERE stats.participant_count > 0) AS conversas_com_participantes,
  COUNT(*) AS total_conversas
FROM (
  SELECT c.id, COUNT(cp.id) AS participant_count
  FROM conversations c
  LEFT JOIN conversation_participants cp ON cp.conversation_id = c.id
  GROUP BY c.id
) stats;

-- -----------------------------------------------------------------------------
-- LISTA DE VERIFICAÇÃO: conversas que ainda ficaram sem participantes
-- (útil para inspeção manual, limite de 50 linhas)
-- -----------------------------------------------------------------------------
SELECT
  c.id,
  c.title,
  c.type,
  c.created_at,
  c.updated_at
FROM conversations c
LEFT JOIN conversation_participants cp ON cp.conversation_id = c.id
GROUP BY c.id
HAVING COUNT(cp.id) = 0
ORDER BY c.updated_at DESC
LIMIT 50;

COMMIT;




