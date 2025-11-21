-- Script SIMPLES para corrigir prazos de petições existentes
-- Versão sem JOINs complexos para evitar erros de referência

-- 1. Função para calcular o próximo dia útil (pulando fins de semana)
CREATE OR REPLACE FUNCTION get_next_business_day(start_date TIMESTAMP WITH TIME ZONE, days_to_add INTEGER)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_date TIMESTAMP WITH TIME ZONE := start_date;
  days_count INTEGER := 0;
BEGIN
  WHILE days_count < days_to_add LOOP
    calculated_date := calculated_date + INTERVAL '1 day';
    -- Pular fins de semana (domingo = 0, sábado = 6)
    IF EXTRACT(DOW FROM calculated_date) NOT IN (0, 6) THEN
      days_count := days_count + 1;
    END IF;
  END LOOP;
  RETURN calculated_date;
END;
$$;

-- 2. Verificar petições que precisam de correção
SELECT
  id,
  title,
  priority,
  created_at,
  deadline,
  EXTRACT(DAY FROM (deadline - created_at)) as dias_diferenca
FROM public.petitions
WHERE EXTRACT(DAY FROM (deadline - created_at)) = 0
ORDER BY created_at DESC;

-- 3. Corrigir petições existentes (versão SIMPLES - sem considerar plano)
UPDATE public.petitions
SET deadline = CASE
  WHEN priority = 'urgent' OR priority = 'high' THEN
    -- 2 dias úteis: adiciona 3 dias
    get_next_business_day(created_at, 2)
  ELSE
    -- 4 dias úteis: adiciona 4 dias
    get_next_business_day(created_at, 4)
END
WHERE EXTRACT(DAY FROM (deadline - created_at)) = 0;

-- 4. Verificar se as petições foram corrigidas
SELECT
  id,
  title,
  priority,
  created_at,
  deadline,
  EXTRACT(DAY FROM (deadline - created_at)) as dias_diferenca,
  CASE
    WHEN EXTRACT(DAY FROM (deadline - created_at)) = 0 THEN 'AINDA INCORRETO'
    ELSE 'CORRIGIDO'
  END as status_final
FROM public.petitions
WHERE EXTRACT(DAY FROM (deadline - created_at)) = 0
ORDER BY created_at DESC;
















