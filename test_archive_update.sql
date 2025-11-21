-- 🧪 TESTE DIRETO DE ARQUIVAMENTO
-- Este script testa se o UPDATE para arquivar conversas funciona diretamente no banco

-- 1. Verificar status atual da conversa
SELECT 
  '🔍 STATUS ATUAL' as info,
  id,
  title,
  status,
  created_by,
  updated_at
FROM conversations 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 2. Tentar arquivar a conversa (UPDATE)
UPDATE conversations 
SET 
  status = 'archived',
  updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Verificar se o UPDATE funcionou
SELECT 
  '✅ STATUS APÓS UPDATE' as info,
  id,
  title,
  status,
  created_by,
  updated_at
FROM conversations 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 4. Se funcionou, reverter para 'active' (para não quebrar o sistema)
UPDATE conversations 
SET 
  status = 'active',
  updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 5. Verificar status final
SELECT 
  '🔄 STATUS FINAL (REVERTIDO)' as info,
  id,
  title,
  status,
  created_by,
  updated_at
FROM conversations 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';























