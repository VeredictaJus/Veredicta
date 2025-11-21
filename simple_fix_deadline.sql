-- Script SIMPLES para corrigir prazos de petições já criadas
-- Versão sem feriados complexos, apenas dias úteis básicos

-- 1. Verificar petições que precisam de correção
SELECT
  id,
  title,
  priority,
  created_at,
  deadline,
  CASE
    WHEN deadline = created_at THEN 'PRECISA CORREÇÃO'
    ELSE 'OK'
  END as status_prazo
FROM public.petitions
WHERE deadline = created_at
ORDER BY created_at DESC;

-- 2. Função simples para calcular prazo (apenas fins de semana)
CREATE OR REPLACE FUNCTION calculate_simple_deadline(start_date TIMESTAMP WITH TIME ZONE, business_days INTEGER)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
  current_date DATE := start_date::DATE;
  days_added INTEGER := 0;
BEGIN
  WHILE days_added < business_days LOOP
    current_date := current_date + INTERVAL '1 day';
    
    -- Pular apenas fins de semana (sábado = 6, domingo = 0)
    IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;
  
  RETURN current_date::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- 3. Corrigir petições existentes
UPDATE public.petitions
SET deadline = CASE
  WHEN priority = 'urgent' OR priority = 'high' THEN 
    calculate_simple_deadline(created_at, 2)
  ELSE 
    calculate_simple_deadline(created_at, 4)
END
WHERE deadline = created_at;

-- 4. Verificar o resultado
SELECT
  id,
  title,
  priority,
  created_at,
  deadline,
  EXTRACT(DAY FROM (deadline - created_at)) as dias_diferenca,
  CASE
    WHEN deadline = created_at THEN 'AINDA INCORRETO'
    ELSE 'CORRIGIDO'
  END as status_final
FROM public.petitions
ORDER BY created_at DESC;

-- 5. Limpar função temporária
DROP FUNCTION IF EXISTS calculate_simple_deadline(TIMESTAMP WITH TIME ZONE, INTEGER);
















