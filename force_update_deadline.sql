-- ========================================
-- FORÇAR ATUALIZAÇÃO DE DEADLINE
-- ========================================
-- 
-- Este script atualiza o deadline de petições que estão em revisão
-- ou foram reatribuídas, garantindo que o prazo seja recalculado
-- mesmo se o trigger estiver interferindo.

-- Primeiro, vamos desabilitar temporariamente o trigger
ALTER TABLE petitions DISABLE TRIGGER trigger_auto_calculate_deadline;

-- Atualizar petições que estão em revisão (correção solicitada)
-- e têm deadline antigo (antes de hoje)
UPDATE petitions
SET 
  deadline = (
    -- Calcular: hoje + 1 dia útil (considerando fins de semana)
    SELECT 
      CASE 
        -- Se hoje é sexta, sábado ou domingo, vai para segunda
        WHEN EXTRACT(DOW FROM NOW()) IN (5, 6, 0) THEN
          -- Se sexta (5), adiciona 3 dias (segunda)
          -- Se sábado (6), adiciona 2 dias (segunda)
          -- Se domingo (0), adiciona 1 dia (segunda)
          (NOW()::DATE + 
           CASE 
             WHEN EXTRACT(DOW FROM NOW()) = 5 THEN 3
             WHEN EXTRACT(DOW FROM NOW()) = 6 THEN 2
             WHEN EXTRACT(DOW FROM NOW()) = 0 THEN 1
             ELSE 1
           END)::TIMESTAMP + INTERVAL '18 hours'
        -- Se hoje é segunda a quinta, adiciona 1 dia
        ELSE
          (NOW()::DATE + INTERVAL '1 day')::TIMESTAMP + INTERVAL '18 hours'
      END
  ),
  updated_at = NOW()
WHERE 
  status = 'revision' 
  AND deadline < NOW()::DATE
  AND correction_requested_at IS NOT NULL;

-- Reabilitar o trigger
ALTER TABLE petitions ENABLE TRIGGER trigger_auto_calculate_deadline;

-- Verificar o resultado
SELECT 
  id,
  title,
  status,
  deadline,
  correction_requested_at,
  CASE 
    WHEN deadline >= NOW()::DATE THEN '✅ Prazo atualizado'
    ELSE '❌ Prazo ainda antigo'
  END as status_prazo
FROM petitions
WHERE status = 'revision'
ORDER BY updated_at DESC
LIMIT 10;







