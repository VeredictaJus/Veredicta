-- ========================================
-- ATUALIZAR PRAZO DE PETIÇÃO ESPECÍFICA
-- ========================================
-- 
-- Script para atualizar o prazo de uma petição que está em revisão
-- e tem prazo antigo (antes de hoje)

-- Opção 1: Atualizar todas as petições em revisão com prazo antigo
UPDATE petitions
SET 
  deadline = (
    -- Hoje + 1 dia útil (considerando fins de semana)
    CASE 
      -- Se hoje é sexta (5), adiciona 3 dias (segunda às 18h)
      WHEN EXTRACT(DOW FROM NOW()) = 5 THEN 
        (NOW()::DATE + INTERVAL '3 days')::TIMESTAMP + INTERVAL '18 hours'
      -- Se hoje é sábado (6), adiciona 2 dias (segunda às 18h)
      WHEN EXTRACT(DOW FROM NOW()) = 6 THEN 
        (NOW()::DATE + INTERVAL '2 days')::TIMESTAMP + INTERVAL '18 hours'
      -- Se hoje é domingo (0), adiciona 1 dia (segunda às 18h)
      WHEN EXTRACT(DOW FROM NOW()) = 0 THEN 
        (NOW()::DATE + INTERVAL '1 day')::TIMESTAMP + INTERVAL '18 hours'
      -- Se hoje é segunda a quinta, adiciona 1 dia (amanhã às 18h)
      ELSE 
        (NOW()::DATE + INTERVAL '1 day')::TIMESTAMP + INTERVAL '18 hours'
    END
  ),
  updated_at = NOW()
WHERE 
  status = 'revision' 
  AND deadline < NOW()::DATE
  AND correction_requested_at IS NOT NULL;

-- Opção 2: Atualizar petição específica pelo display_id (PET-2025-0005)
-- Descomente e ajuste o display_id se necessário
/*
UPDATE petitions
SET 
  deadline = (
    CASE 
      WHEN EXTRACT(DOW FROM NOW()) = 5 THEN 
        (NOW()::DATE + INTERVAL '3 days')::TIMESTAMP + INTERVAL '18 hours'
      WHEN EXTRACT(DOW FROM NOW()) = 6 THEN 
        (NOW()::DATE + INTERVAL '2 days')::TIMESTAMP + INTERVAL '18 hours'
      WHEN EXTRACT(DOW FROM NOW()) = 0 THEN 
        (NOW()::DATE + INTERVAL '1 day')::TIMESTAMP + INTERVAL '18 hours'
      ELSE 
        (NOW()::DATE + INTERVAL '1 day')::TIMESTAMP + INTERVAL '18 hours'
    END
  ),
  updated_at = NOW()
WHERE 
  display_id = 'PET-2025-0005';
*/

-- Verificar o resultado
SELECT 
  id,
  display_id,
  title,
  status,
  deadline,
  correction_requested_at,
  NOW()::DATE as hoje,
  deadline::DATE as prazo_data,
  CASE 
    WHEN deadline >= NOW()::DATE THEN '✅ Prazo atualizado'
    ELSE '❌ Prazo ainda antigo'
  END as status_prazo
FROM petitions
WHERE status = 'revision'
ORDER BY updated_at DESC
LIMIT 10;





























