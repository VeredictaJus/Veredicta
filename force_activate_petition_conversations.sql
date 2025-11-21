-- Forçar todas as conversas de petições para status 'active'
-- Corrigir conversas que foram arquivadas incorretamente

-- 1. Verificar status atual
SELECT 
  '📊 STATUS ATUAL DAS CONVERSAS' as info,
  status,
  COUNT(*) as total
FROM conversations
WHERE type = 'petition'
GROUP BY status;

-- 2. Atualizar TODAS as conversas de petições para 'active'
UPDATE conversations
SET 
  status = 'active',
  updated_at = NOW()
WHERE type = 'petition'
AND status != 'active';

-- 3. Verificar quantas foram atualizadas
SELECT 
  '✅ CONVERSAS ATUALIZADAS' as info,
  COUNT(*) as total_ativadas
FROM conversations
WHERE type = 'petition'
AND status = 'active';

-- 4. Ver detalhes das conversas de petições
SELECT 
  c.id,
  c.title,
  c.type,
  c.status,
  c.created_by,
  c.created_at,
  c.updated_at
FROM conversations c
WHERE c.type = 'petition'
ORDER BY c.created_at DESC
LIMIT 10;









