-- ============================================
-- GERAR PROTOCOLOS PARA CONVERSAS DE SUPORTE EXISTENTES
-- Execute este script no Supabase SQL Editor
-- ============================================

-- Atualizar conversas de suporte existentes com números de protocolo
-- O protocolo será gerado baseado na data de criação (ordem cronológica)
WITH numbered_conversations AS (
  SELECT 
    id,
    created_at,
    EXTRACT(YEAR FROM created_at) as year,
    ROW_NUMBER() OVER (
      PARTITION BY EXTRACT(YEAR FROM created_at) 
      ORDER BY created_at ASC
    ) as protocol_seq
  FROM conversations
  WHERE type = 'support' 
    AND (metadata->>'protocol_number' IS NULL OR metadata->>'protocol_number' = '')
)
UPDATE conversations c
SET metadata = jsonb_set(
  COALESCE(c.metadata, '{}'::jsonb),
  '{protocol_number}',
  to_jsonb(
    'PROTO-' || 
    nc.year::text || '-' || 
    LPAD(nc.protocol_seq::text, 4, '0')
  )
)
FROM numbered_conversations nc
WHERE c.id = nc.id;

-- Verificar quantas conversas foram atualizadas
SELECT 
  COUNT(*) as total_updated,
  MIN(metadata->>'protocol_number') as primeiro_protocolo,
  MAX(metadata->>'protocol_number') as ultimo_protocolo
FROM conversations
WHERE type = 'support' 
  AND metadata->>'protocol_number' IS NOT NULL;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

