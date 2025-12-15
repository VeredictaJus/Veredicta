-- Corrigir conversa existente que não tem petition_id associado

-- 1. Ver conversas do tipo 'petition' sem petition_id
SELECT 
  id,
  title,
  type,
  petition_id,
  metadata,
  created_at
FROM conversations
WHERE type = 'petition'
  AND petition_id IS NULL;

-- 2. Atualizar a conversa para associar à petição "Teste"
UPDATE conversations
SET 
  petition_id = 'cfe1e2ea-78e9-47d6-9e96-23afe0a844c9',  -- ID da petição "Teste"
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('petitionId', 'cfe1e2ea-78e9-47d6-9e96-23afe0a844c9'),
  updated_at = NOW()
WHERE id = '81d61ded-0061-4edb-bfb5-bae756b8c02b'
  AND type = 'petition'
  AND petition_id IS NULL;

-- 3. Verificar se atualizou
SELECT 
  id,
  title,
  type,
  petition_id,
  metadata,
  updated_at
FROM conversations
WHERE id = '81d61ded-0061-4edb-bfb5-bae756b8c02b';







