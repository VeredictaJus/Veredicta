-- Script para corrigir especificamente a petição "Teste"
-- que tem prazo incorreto (caindo em sábado)

-- 1. Verificar a petição "Teste" atual
SELECT
  id,
  title,
  priority,
  created_at,
  deadline,
  EXTRACT(DOW FROM created_at) as dia_semana_criacao,
  EXTRACT(DOW FROM deadline) as dia_semana_prazo,
  EXTRACT(DAY FROM (deadline - created_at)) as dias_diferenca
FROM public.petitions
WHERE title = 'Teste';

-- 2. Corrigir especificamente a petição "Teste"
UPDATE public.petitions
SET deadline = get_next_business_day(created_at, 4)
WHERE title = 'Teste';

-- 3. Verificar se foi corrigida
SELECT
  id,
  title,
  priority,
  created_at,
  deadline,
  EXTRACT(DOW FROM created_at) as dia_semana_criacao,
  EXTRACT(DOW FROM deadline) as dia_semana_prazo,
  EXTRACT(DAY FROM (deadline - created_at)) as dias_diferenca,
  CASE
    WHEN EXTRACT(DOW FROM deadline) IN (0, 6) THEN 'AINDA INCORRETO (fim de semana)'
    ELSE 'CORRIGIDO'
  END as status_final
FROM public.petitions
WHERE title = 'Teste';
















