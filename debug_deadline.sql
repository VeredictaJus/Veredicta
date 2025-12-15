-- Script para verificar se o prazo está sendo salvo corretamente

-- 1. Ver todas as petições com suas datas
SELECT
  id,
  title,
  status,
  priority,
  created_at,
  deadline,
  EXTRACT(DAY FROM (deadline - created_at)) as dias_diferenca
FROM public.petitions
ORDER BY created_at DESC;

-- 2. Verificar se há petições com prazo igual à data de criação
SELECT
  id,
  title,
  created_at,
  deadline,
  CASE 
    WHEN deadline = created_at THEN 'PROBLEMA: Prazo igual à criação'
    ELSE 'OK: Prazo diferente da criação'
  END as status_prazo
FROM public.petitions
WHERE deadline IS NOT NULL;

-- 3. Verificar tipos de dados das colunas
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'petitions' 
AND column_name IN ('created_at', 'deadline');
















