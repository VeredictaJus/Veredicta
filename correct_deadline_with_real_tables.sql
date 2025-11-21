-- Script para corrigir prazos de petições existentes com base no plano do cliente
-- Usando as tabelas corretas descobertas: plans, user_subscriptions, users

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
  p.id,
  p.title,
  p.priority,
  p.created_at,
  p.deadline,
  EXTRACT(DAY FROM (p.deadline - p.created_at)) as dias_diferenca,
  -- Tentar obter o plano do usuário de diferentes fontes
  COALESCE(us.plan_code, u.plano, 'free') as plan_code
FROM public.petitions p
LEFT JOIN public.user_subscriptions us ON p.client_id = us.user_id
LEFT JOIN public.users u ON p.client_id = u.id::text
WHERE EXTRACT(DAY FROM (p.deadline - p.created_at)) = 0
ORDER BY p.created_at DESC;

-- 3. Corrigir petições existentes com prazo incorreto, considerando o plano do cliente
UPDATE public.petitions p
SET deadline =
  CASE
    -- Plano ELITE: 1 dia útil
    WHEN COALESCE(us.plan_code, u.plano, 'free') = 'elite' THEN get_next_business_day(p.created_at, 1)
    -- Plano PRO: 2 dias úteis
    WHEN COALESCE(us.plan_code, u.plano, 'free') = 'pro' THEN get_next_business_day(p.created_at, 2)
    -- Plano START: 3 dias úteis
    WHEN COALESCE(us.plan_code, u.plano, 'free') = 'start' THEN get_next_business_day(p.created_at, 3)
    -- Plano FREE: 4 dias úteis
    WHEN COALESCE(us.plan_code, u.plano, 'free') = 'free' THEN get_next_business_day(p.created_at, 4)
    -- Padrão (fallback): 4 dias úteis
    ELSE get_next_business_day(p.created_at, 4)
  END
FROM public.user_subscriptions us
LEFT JOIN public.users u ON p.client_id = u.id::text
WHERE p.client_id = us.user_id
  AND EXTRACT(DAY FROM (p.deadline - p.created_at)) = 0; -- Apenas petições com prazo incorreto

-- 4. Verificar se as petições foram corrigidas
SELECT
  p.id,
  p.title,
  p.priority,
  COALESCE(us.plan_code, u.plano, 'free') as plan_code,
  p.created_at,
  p.deadline,
  EXTRACT(DAY FROM (p.deadline - p.created_at)) as dias_diferenca,
  CASE
    WHEN EXTRACT(DAY FROM (p.deadline - p.created_at)) = 0 THEN 'AINDA INCORRETO'
    ELSE 'CORRIGIDO'
  END as status_final
FROM public.petitions p
LEFT JOIN public.user_subscriptions us ON p.client_id = us.user_id
LEFT JOIN public.users u ON p.client_id = u.id::text
WHERE EXTRACT(DAY FROM (p.deadline - p.created_at)) = 0
ORDER BY p.created_at DESC;
