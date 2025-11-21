-- Script CORRETO para corrigir prazos baseado no PLANO do usuário
-- Considera os prazos específicos de cada plano

-- 1. Verificar petições que precisam de correção
SELECT
  p.id,
  p.title,
  p.priority,
  p.created_at,
  p.deadline,
  p.client_id,
  up.plan_code,
  CASE
    WHEN p.deadline = p.created_at THEN 'PRECISA CORREÇÃO'
    ELSE 'OK'
  END as status_prazo
FROM public.petitions p
LEFT JOIN public.user_plans up ON p.client_id = up.user_id
WHERE p.deadline = p.created_at
ORDER BY p.created_at DESC;

-- 2. Corrigir petições baseado no PLANO do usuário
UPDATE public.petitions
SET deadline = CASE
  -- Plano ELITE: 1 dia útil (adiciona 2 dias para garantir)
  WHEN up.plan_code = 'elite' THEN 
    p.created_at + INTERVAL '2 days'
  -- Plano PRO: 2 dias úteis (adiciona 3 dias para garantir)
  WHEN up.plan_code = 'pro' THEN 
    p.created_at + INTERVAL '3 days'
  -- Plano START: 3 dias úteis (adiciona 4 dias para garantir)
  WHEN up.plan_code = 'start' THEN 
    p.created_at + INTERVAL '4 days'
  -- Plano FREE ou sem plano: 4 dias úteis (adiciona 6 dias para garantir)
  ELSE 
    p.created_at + INTERVAL '6 days'
END
FROM public.user_plans up
WHERE public.petitions.client_id = up.user_id
AND public.petitions.deadline = public.petitions.created_at;

-- 3. Verificar o resultado
SELECT
  p.id,
  p.title,
  p.priority,
  p.created_at,
  p.deadline,
  up.plan_code,
  EXTRACT(DAY FROM (p.deadline - p.created_at)) as dias_diferenca,
  CASE
    WHEN EXTRACT(DAY FROM (p.deadline - p.created_at)) = 0 THEN 'AINDA INCORRETO'
    ELSE 'CORRIGIDO'
  END as status_final
FROM public.petitions p
LEFT JOIN public.user_plans up ON p.client_id = up.user_id
ORDER BY p.created_at DESC;
















