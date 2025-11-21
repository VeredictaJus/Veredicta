-- Corrigir TODAS as conversas de petição sem petition_id

-- Atualizar todas as conversas "Petição: Teste" com a petição correta
UPDATE conversations
SET 
  petition_id = 'cfe1e2ea-78e9-47d6-9e96-23afe0a844c9',  -- ID da petição "Teste"
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('petitionId', 'cfe1e2ea-78e9-47d6-9e96-23afe0a844c9'),
  updated_at = NOW()
WHERE type = 'petition'
  AND title ILIKE '%teste%'
  AND petition_id IS NULL;

-- Verificar quantas foram atualizadas
SELECT 
  COUNT(*) as total_atualizado
FROM conversations
WHERE type = 'petition'
  AND title ILIKE '%teste%'
  AND petition_id = 'cfe1e2ea-78e9-47d6-9e96-23afe0a844c9';

-- Ver resultado
SELECT 
  id,
  title,
  petition_id,
  metadata->>'petitionId' as metadata_petition_id,
  created_at
FROM conversations
WHERE type = 'petition'
  AND title ILIKE '%teste%'
ORDER BY created_at DESC;







