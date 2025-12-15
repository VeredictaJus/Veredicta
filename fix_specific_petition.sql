-- Script para corrigir a petição "Teste" específica
-- Corrigir petição que tem prazo no mesmo dia da criação

-- 1. Verificar a petição específica
SELECT
  id,
  title,
  priority,
  created_at,
  deadline,
  EXTRACT(DAY FROM (deadline - created_at)) as dias_diferenca
FROM public.petitions
WHERE title = 'Teste';

-- 2. Corrigir a petição específica
UPDATE public.petitions
SET deadline = CASE
  WHEN priority = 'urgent' OR priority = 'high' THEN 
    -- 2 dias úteis: adiciona 3 dias
    created_at + INTERVAL '3 days'
  ELSE 
    -- 4 dias úteis: adiciona 6 dias
    created_at + INTERVAL '6 days'
END
WHERE title = 'Teste';

-- 3. Verificar se foi corrigida
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
WHERE title = 'Teste';
