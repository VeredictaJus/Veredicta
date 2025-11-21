-- Script ULTRA SIMPLES para corrigir prazos
-- Sem funções complexas, apenas UPDATE direto

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

-- 2. Corrigir petições existentes (versão simples)
UPDATE public.petitions
SET deadline = CASE
  WHEN priority = 'urgent' OR priority = 'high' THEN 
    -- 2 dias úteis: adiciona 3 dias (pode cair em fim de semana)
    created_at + INTERVAL '3 days'
  ELSE 
    -- 4 dias úteis: adiciona 6 dias (pode cair em fim de semana)
    created_at + INTERVAL '6 days'
END
WHERE deadline = created_at;

-- 3. Verificar o resultado
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
















