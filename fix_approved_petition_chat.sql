-- ========================================
-- ARQUIVAR CHAT DE PETIÇÃO JÁ APROVADA
-- ========================================

-- Passo 1: Buscar petições aprovadas
SELECT 
  id,
  display_id,
  title,
  status,
  client_id,
  assigned_writer_id,
  updated_at
FROM petitions
WHERE status = 'approved'
ORDER BY updated_at DESC
LIMIT 5;

-- Passo 2: Buscar conversas relacionadas à petição aprovada
-- (Substitua o petition_id pelo ID da petição aprovada acima)
SELECT 
  id as conversation_id,
  title as conversation_title,
  type,
  status as conversation_status,
  petition_id,
  created_by,
  metadata,
  created_at,
  updated_at
FROM conversations
WHERE type = 'petition'
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 10;

-- Passo 3: Verificar se há petition_id nas conversas
SELECT 
  c.id as conversation_id,
  c.title as conversation_title,
  c.petition_id,
  c.status as conversation_status,
  p.id as petition_real_id,
  p.title as petition_title,
  p.status as petition_status
FROM conversations c
LEFT JOIN petitions p ON c.petition_id = p.id
WHERE c.type = 'petition'
  AND c.status = 'active'
ORDER BY c.created_at DESC;

-- Passo 4: ARQUIVAR MANUALMENTE as conversas de petições aprovadas
-- ⚠️ Substitua 'PETITION_ID_AQUI' pelo ID real da petição aprovada
UPDATE conversations
SET 
  status = 'archived',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'system_archived', true,
    'archived_reason', 'petition_approved',
    'archived_at', NOW()::TEXT
  ),
  updated_at = NOW()
WHERE petition_id IN (
  SELECT id FROM petitions WHERE status = 'approved'
)
AND status = 'active'
AND type = 'petition';

-- Passo 5: Enviar mensagem de conclusão nas conversas arquivadas
-- ⚠️ Isso vai inserir mensagem em TODAS as conversas de petições aprovadas
INSERT INTO messages (conversation_id, sender_id, content, message_type, status, created_at)
SELECT 
  c.id,
  'system',
  '🎉 Obrigado por aprovar! A petição foi concluída com sucesso.' || E'\n\n' || 'Você pode baixar os arquivos a qualquer momento em Minhas Petições.',
  'system',
  'sent',
  NOW()
FROM conversations c
WHERE c.petition_id IN (SELECT id FROM petitions WHERE status = 'approved')
  AND c.status = 'archived'
  AND c.type = 'petition'
  AND c.metadata->>'system_archived' = 'true'
  AND NOT EXISTS (
    -- Evitar duplicar mensagem se já existe
    SELECT 1 FROM messages m 
    WHERE m.conversation_id = c.id 
      AND m.sender_id = 'system'
      AND m.content LIKE '%Obrigado por aprovar%'
  );

-- Passo 6: Verificar resultado (conversas arquivadas)
SELECT 
  c.id as conversation_id,
  c.title,
  c.status,
  c.metadata->>'system_archived' as system_archived,
  c.metadata->>'archived_reason' as reason,
  p.title as petition_title,
  p.status as petition_status
FROM conversations c
LEFT JOIN petitions p ON c.petition_id = p.id
WHERE c.type = 'petition'
  AND c.status = 'archived'
ORDER BY c.updated_at DESC
LIMIT 10;







