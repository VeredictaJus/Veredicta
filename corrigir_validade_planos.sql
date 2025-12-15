-- ============================================
-- CORREÇÃO: Validade dos Planos (Start: 30d, Pro: 60d, Elite: 90d)
-- ============================================
-- Este script corrige o sistema para usar validades corretas dos planos

-- 1. Adicionar coluna de validade na tabela plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS validity_days INTEGER DEFAULT 30;

-- 2. Atualizar validades dos planos
UPDATE plans SET validity_days = 30 WHERE plan_code = 'start';
UPDATE plans SET validity_days = 60 WHERE plan_code = 'pro';
UPDATE plans SET validity_days = 90 WHERE plan_code = 'elite';
UPDATE plans SET validity_days = 999999 WHERE plan_code = 'free'; -- Free não expira

-- 3. Adicionar comentário na coluna
COMMENT ON COLUMN plans.validity_days IS 'Validade do plano em dias (Start: 30, Pro: 60, Elite: 90, Free: ilimitado)';

-- 4. Função para contar petições no período de validade
CREATE OR REPLACE FUNCTION get_petitions_usage_in_period(p_user_id TEXT, p_days INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_usage INTEGER;
BEGIN
  -- Contar petições criadas no período especificado
  SELECT COUNT(*)::INTEGER
  INTO v_usage
  FROM petitions
  WHERE client_id = p_user_id
    AND created_at >= (CURRENT_DATE - INTERVAL '1 day' * p_days);
  
  RETURN COALESCE(v_usage, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Atualizar função get_user_petition_limit para usar validade correta
CREATE OR REPLACE FUNCTION get_user_petition_limit(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_subscription RECORD;
  v_plan RECORD;
  v_base_limit INTEGER;
  v_bonus INTEGER := 0;
  v_total_limit INTEGER;
  v_validity_days INTEGER;
  v_last_renewal RECORD;
BEGIN
  -- Buscar assinatura ativa do usuário
  SELECT us.plan_code, us.created_at, us.status
  INTO v_subscription
  FROM user_subscriptions us
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- Se não tem assinatura ativa, retornar limite free
  IF NOT FOUND THEN
    RETURN json_build_object(
      'plan_code', 'free',
      'base_limit', 1,
      'bonus', 0,
      'total_limit', 1,
      'validity_days', 999999,
      'has_active_plan', FALSE
    );
  END IF;

  -- Buscar informações do plano
  SELECT p.petitions_limit, p.renewal_bonus, p.name, p.validity_days
  INTO v_plan
  FROM plans p
  WHERE p.plan_code = v_subscription.plan_code
    AND p.is_active = TRUE;

  IF NOT FOUND THEN
    -- Plano não encontrado, retornar free
    RETURN json_build_object(
      'plan_code', 'free',
      'base_limit', 1,
      'bonus', 0,
      'total_limit', 1,
      'validity_days', 999999,
      'has_active_plan', FALSE
    );
  END IF;

  v_base_limit := COALESCE(v_plan.petitions_limit, 0);
  v_validity_days := COALESCE(v_plan.validity_days, 30);

  -- Verificar se houve renovação no período de validade
  SELECT sr.bonus_petitions, sr.renewal_date
  INTO v_last_renewal
  FROM subscription_renewals sr
  WHERE sr.user_id = p_user_id
    AND sr.plan_code = v_subscription.plan_code
    AND sr.status = 'completed'
    AND sr.renewal_date >= (CURRENT_DATE - INTERVAL '1 day' * v_validity_days)
  ORDER BY sr.renewal_date DESC
  LIMIT 1;

  -- Se houve renovação no período, adicionar bônus
  IF FOUND THEN
    v_bonus := COALESCE(v_last_renewal.bonus_petitions, 0);
  END IF;

  v_total_limit := v_base_limit + v_bonus;

  RETURN json_build_object(
    'plan_code', v_subscription.plan_code,
    'plan_name', v_plan.name,
    'base_limit', v_base_limit,
    'bonus', v_bonus,
    'total_limit', v_total_limit,
    'validity_days', v_validity_days,
    'has_active_plan', TRUE,
    'renewed_in_period', FOUND
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Atualizar função check_user_can_create_petition para usar validade correta
CREATE OR REPLACE FUNCTION check_user_can_create_petition(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_limit_info JSON;
  v_usage INTEGER;
  v_plan_code TEXT;
  v_total_limit INTEGER;
  v_validity_days INTEGER;
  v_has_active_plan BOOLEAN;
  v_credits INTEGER;
BEGIN
  -- Obter limite do usuário (com bônus se houver)
  v_limit_info := get_user_petition_limit(p_user_id);
  
  v_plan_code := (v_limit_info->>'plan_code')::TEXT;
  v_total_limit := (v_limit_info->>'total_limit')::INTEGER;
  v_validity_days := (v_limit_info->>'validity_days')::INTEGER;
  v_has_active_plan := (v_limit_info->>'has_active_plan')::BOOLEAN;

  -- Se é plano free, verificar total de petições (não tem validade)
  IF v_plan_code = 'free' THEN
    v_usage := get_free_petitions_usage(p_user_id);
    
    IF v_usage >= v_total_limit THEN
      -- Verificar se tem créditos
      SELECT COALESCE(credits_balance, 0)
      INTO v_credits
      FROM user_profiles
      WHERE firebase_uid = p_user_id;
      
      IF v_credits > 0 THEN
        RETURN json_build_object(
          'can_submit', TRUE,
          'reason', 'using_credits',
          'message', 'Usando créditos disponíveis'
        );
      END IF;
      
      RETURN json_build_object(
        'can_submit', FALSE,
        'reason', 'free_limit_reached',
        'message', 'Você atingiu o limite de 1 petição gratuita. Assine um plano para continuar.',
        'redirect_to', '/client/plans',
        'usage', v_usage,
        'limit', v_total_limit
      );
    END IF;
  ELSE
    -- Plano pago: verificar uso no período de validade
    v_usage := get_petitions_usage_in_period(p_user_id, v_validity_days);
    
    IF v_usage >= v_total_limit THEN
      -- Verificar se tem créditos
      SELECT COALESCE(credits_balance, 0)
      INTO v_credits
      FROM user_profiles
      WHERE firebase_uid = p_user_id;
      
      IF v_credits > 0 THEN
        RETURN json_build_object(
          'can_submit', TRUE,
          'reason', 'using_credits',
          'message', 'Usando créditos disponíveis'
        );
      END IF;
      
      RETURN json_build_object(
        'can_submit', FALSE,
        'reason', 'period_limit_reached',
        'message', format('Você atingiu o limite de %s petições do seu plano %s (%s dias). Aguarde a renovação ou adquira créditos extras.', 
                         v_total_limit, 
                         (v_limit_info->>'plan_name')::TEXT,
                         v_validity_days),
        'redirect_to', '/client/plans',
        'usage', v_usage,
        'limit', v_total_limit,
        'plan_code', v_plan_code,
        'validity_days', v_validity_days
      );
    END IF;
  END IF;

  -- Usuário pode criar petição
  RETURN json_build_object(
    'can_submit', TRUE,
    'reason', 'within_limit',
    'message', 'Você pode criar esta petição',
    'usage', v_usage,
    'limit', v_total_limit,
    'remaining', v_total_limit - v_usage,
    'plan_code', v_plan_code,
    'validity_days', v_validity_days
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Atualizar função get_user_petition_stats para usar validade correta
CREATE OR REPLACE FUNCTION get_user_petition_stats(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_limit_info JSON;
  v_period_usage INTEGER;
  v_total_usage INTEGER;
  v_credits INTEGER;
  v_plan_code TEXT;
  v_validity_days INTEGER;
BEGIN
  -- Obter limite do usuário
  v_limit_info := get_user_petition_limit(p_user_id);
  v_plan_code := (v_limit_info->>'plan_code')::TEXT;
  v_validity_days := (v_limit_info->>'validity_days')::INTEGER;
  
  -- Obter uso no período de validade
  IF v_plan_code = 'free' THEN
    v_period_usage := get_free_petitions_usage(p_user_id);
  ELSE
    v_period_usage := get_petitions_usage_in_period(p_user_id, v_validity_days);
  END IF;
  
  -- Obter uso total
  SELECT COUNT(*)::INTEGER
  INTO v_total_usage
  FROM petitions
  WHERE client_id = p_user_id;
  
  -- Obter créditos
  SELECT COALESCE(credits_balance, 0)
  INTO v_credits
  FROM user_profiles
  WHERE firebase_uid = p_user_id;
  
  RETURN json_build_object(
    'plan_info', v_limit_info,
    'period_usage', v_period_usage,
    'total_usage', v_total_usage,
    'credits_balance', v_credits,
    'period_remaining', (v_limit_info->>'total_limit')::INTEGER - v_period_usage,
    'validity_days', v_validity_days
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Conceder permissões
GRANT EXECUTE ON FUNCTION get_petitions_usage_in_period(TEXT, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_petition_limit(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION check_user_can_create_petition(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_petition_stats(TEXT) TO authenticated, service_role;

-- 9. Comentários atualizados
COMMENT ON FUNCTION get_petitions_usage_in_period(TEXT, INTEGER) IS 'Retorna o número de petições criadas pelo usuário no período especificado em dias';
COMMENT ON FUNCTION get_user_petition_limit(TEXT) IS 'Retorna o limite de petições do usuário com validade correta (Start: 30d, Pro: 60d, Elite: 90d)';
COMMENT ON FUNCTION check_user_can_create_petition(TEXT) IS 'Verifica se o usuário pode criar petição baseado na validade do plano';
COMMENT ON FUNCTION get_user_petition_stats(TEXT) IS 'Retorna estatísticas de uso considerando a validade do plano';

-- ============================================
-- TESTE: Verificar se a correção funcionou
-- ============================================
-- Execute estes testes para verificar:
-- 
-- 1. Verificar validades dos planos:
-- SELECT plan_code, name, petitions_limit, validity_days FROM plans WHERE is_active = true;
--
-- 2. Testar limite do usuário:
-- SELECT get_user_petition_limit('SEU_FIREBASE_UID_AQUI');
--
-- 3. Testar se pode criar petição:
-- SELECT check_user_can_create_petition('SEU_FIREBASE_UID_AQUI');
--
-- 4. Ver estatísticas:
-- SELECT get_user_petition_stats('SEU_FIREBASE_UID_AQUI');
-- ============================================




















