-- ========================================
-- Função: check_revision_limit
-- Regras de revisão humana por plano:
--   • Plano Free      → 1 revisão total (não renova)
--   • Plano Start     → 1 revisão por ciclo de assinatura
--   • Planos Pro/Elite→ 1 revisão por petição
-- ========================================
CREATE OR REPLACE FUNCTION public.check_revision_limit(p_petition_id UUID)
RETURNS TABLE (
  allowed BOOLEAN,
  plan TEXT,
  message TEXT,
  used INTEGER,
  limit INTEGER,
  reset_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_client_id TEXT;
  v_plan_code TEXT;
  v_normalized_plan TEXT;
  v_cycle_start TIMESTAMPTZ;
  v_cycle_end TIMESTAMPTZ;
  v_used INTEGER := 0;
  v_limit INTEGER := 1;
BEGIN
  -- Identificar cliente da petição
  SELECT client_id
    INTO v_client_id
  FROM petitions
  WHERE id = p_petition_id;

  IF v_client_id IS NULL THEN
    allowed := FALSE;
    plan := 'unknown';
    message := 'Petição não encontrada.';
    used := 0;
    limit := 0;
    reset_at := NULL;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Buscar assinatura ativa mais recente (Stripe realtime)
  SELECT usa.plan_code,
         usa.current_period_start,
         usa.current_period_end
    INTO v_plan_code,
         v_cycle_start,
         v_cycle_end
  FROM user_subscriptions_active usa
  WHERE usa.user_id = v_client_id
    AND usa.status = 'active'
  ORDER BY usa.current_period_end DESC
  LIMIT 1;

  -- Fallback para tabela legada de assinaturas
  IF v_plan_code IS NULL THEN
    SELECT us.plan_code,
           us.next_billing_date
      INTO v_plan_code,
           v_cycle_end
    FROM user_subscriptions us
    WHERE us.user_id = v_client_id
      AND us.status = 'active'
    ORDER BY COALESCE(us.updated_at, us.created_at, now()) DESC
    LIMIT 1;

    IF v_cycle_end IS NOT NULL THEN
      v_cycle_start := v_cycle_end - INTERVAL '30 days';
    END IF;
  END IF;

  IF v_plan_code IS NULL OR trim(v_plan_code) = '' THEN
    v_plan_code := 'free';
  END IF;

  -- Normalizar códigos de plano equivalentes
  v_normalized_plan := CASE
    WHEN LOWER(v_plan_code) LIKE 'free%' THEN 'free'
    WHEN LOWER(v_plan_code) LIKE 'start%' THEN 'start'
    WHEN LOWER(v_plan_code) LIKE 'starter%' THEN 'start'
    WHEN LOWER(v_plan_code) LIKE 'pro%' THEN 'pro'
    WHEN LOWER(v_plan_code) LIKE 'professional%' THEN 'pro'
    WHEN LOWER(v_plan_code) LIKE 'elite%' THEN 'elite'
    WHEN LOWER(v_plan_code) LIKE 'premium%' THEN 'elite'
    ELSE LOWER(v_plan_code)
  END;

  -- Contabilizar uso conforme plano
  IF v_normalized_plan = 'free' THEN
    v_limit := 1;
    SELECT COUNT(*)
      INTO v_used
    FROM corrections c
    JOIN petitions p ON p.id = c.petition_id
    WHERE p.client_id = v_client_id;

    message := CASE
      WHEN v_used >= v_limit THEN 'Plano Free: a revisão humana única já foi utilizada.'
      ELSE 'Plano Free: revisão humana disponível.'
    END;

  ELSIF v_normalized_plan = 'start' THEN
    v_limit := 1;

    IF v_cycle_start IS NULL THEN
      v_cycle_start := date_trunc('month', now());
    END IF;

    IF v_cycle_end IS NULL THEN
      v_cycle_end := v_cycle_start + INTERVAL '1 month';
    END IF;

    SELECT COUNT(*)
      INTO v_used
    FROM corrections c
    JOIN petitions p ON p.id = c.petition_id
    WHERE p.client_id = v_client_id
      AND COALESCE(c.created_at, now()) >= v_cycle_start
      AND COALESCE(c.created_at, now()) < v_cycle_end;

    message := CASE
      WHEN v_used >= v_limit THEN
        format(
          'Plano Start: revisão humana estará disponível novamente em %s.',
          to_char(v_cycle_end AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')
        )
      ELSE
        format(
          'Plano Start: revisão humana disponível. Ciclo atual encerra em %s.',
          to_char(v_cycle_end AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')
        )
    END;

  ELSE
    v_limit := 1;
    SELECT COUNT(*)
      INTO v_used
    FROM corrections c
    WHERE c.petition_id = p_petition_id;

    message := CASE
      WHEN v_used >= v_limit THEN 'Revisão humana desta petição já foi utilizada.'
      ELSE 'Revisão humana disponível para esta petição.'
    END;
  END IF;

  allowed := v_used < v_limit;
  plan := v_normalized_plan;
  used := v_used;
  limit := v_limit;
  reset_at := CASE WHEN v_normalized_plan = 'start' THEN v_cycle_end ELSE NULL END;

  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION public.check_revision_limit(UUID)
  IS 'Aplica regras de revisão humana por plano, retornando disponibilidade, contagem usada e próximo reset.';

GRANT EXECUTE ON FUNCTION public.check_revision_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_revision_limit(UUID) TO anon;




