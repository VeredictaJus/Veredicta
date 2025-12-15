-- ============================================
-- SISTEMA COMPLETO DE BLOQUEIO POR PLANO
-- ============================================
-- Este script implementa o controle de limites de petições
-- para TODOS os planos, incluindo bônus de renovação

-- ============================================
-- 1. FUNÇÃO: Contar petições usadas no mês atual
-- ============================================
CREATE OR REPLACE FUNCTION get_monthly_petitions_usage(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_usage INTEGER;
BEGIN
  -- Contar petições criadas no mês atual
  SELECT COUNT(*)::INTEGER
  INTO v_usage
  FROM petitions
  WHERE client_id = p_user_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE);
  
  RETURN COALESCE(v_usage, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. FUNÇÃO: Contar petições gratuitas (plano free) usadas
-- ============================================
CREATE OR REPLACE FUNCTION get_free_petitions_usage(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_usage INTEGER;
BEGIN
  -- Contar TODAS as petições do usuário (plano free permite apenas 2 no total)
  SELECT COUNT(*)::INTEGER
  INTO v_usage
  FROM petitions
  WHERE client_id = p_user_id;
  
  RETURN COALESCE(v_usage, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. FUNÇÃO: Obter limite de petições do plano (com bônus)
-- ============================================
CREATE OR REPLACE FUNCTION get_user_petition_limit(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_subscription RECORD;
  v_plan RECORD;
  v_base_limit INTEGER;
  v_bonus INTEGER := 0;
  v_total_limit INTEGER;
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
      'has_active_plan', FALSE
    );
  END IF;

  -- Buscar informações do plano
  SELECT p.petitions_limit, p.renewal_bonus, p.name
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
      'has_active_plan', FALSE
    );
  END IF;

  v_base_limit := COALESCE(v_plan.petitions_limit, 0);

  -- Verificar se houve renovação no mês atual
  SELECT sr.bonus_petitions, sr.renewal_date
  INTO v_last_renewal
  FROM subscription_renewals sr
  WHERE sr.user_id = p_user_id
    AND sr.plan_code = v_subscription.plan_code
    AND sr.status = 'completed'
    AND EXTRACT(YEAR FROM sr.renewal_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM sr.renewal_date) = EXTRACT(MONTH FROM CURRENT_DATE)
  ORDER BY sr.renewal_date DESC
  LIMIT 1;

  -- Se houve renovação no mês atual, adicionar bônus
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
    'has_active_plan', TRUE,
    'renewed_this_month', FOUND
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. FUNÇÃO PRINCIPAL: Verificar se usuário pode criar petição
-- ============================================
CREATE OR REPLACE FUNCTION check_user_can_create_petition(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_limit_info JSON;
  v_usage INTEGER;
  v_plan_code TEXT;
  v_total_limit INTEGER;
  v_has_active_plan BOOLEAN;
  v_credits INTEGER;
BEGIN
  -- Obter limite do usuário (com bônus se houver)
  v_limit_info := get_user_petition_limit(p_user_id);
  
  v_plan_code := (v_limit_info->>'plan_code')::TEXT;
  v_total_limit := (v_limit_info->>'total_limit')::INTEGER;
  v_has_active_plan := (v_limit_info->>'has_active_plan')::BOOLEAN;

  -- Se é plano free, verificar total de petições (não mensal)
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
    -- Plano pago: verificar uso mensal
    v_usage := get_monthly_petitions_usage(p_user_id);
    
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
        'reason', 'monthly_limit_reached',
        'message', format('Você atingiu o limite mensal de %s petições do seu plano %s. Aguarde a renovação ou adquira créditos extras.', 
                         v_total_limit, 
                         (v_limit_info->>'plan_name')::TEXT),
        'redirect_to', '/client/plans',
        'usage', v_usage,
        'limit', v_total_limit,
        'plan_code', v_plan_code
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
    'plan_code', v_plan_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. FUNÇÃO: Obter estatísticas de uso do usuário
-- ============================================
CREATE OR REPLACE FUNCTION get_user_petition_stats(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_limit_info JSON;
  v_monthly_usage INTEGER;
  v_total_usage INTEGER;
  v_credits INTEGER;
  v_plan_code TEXT;
BEGIN
  -- Obter limite do usuário
  v_limit_info := get_user_petition_limit(p_user_id);
  v_plan_code := (v_limit_info->>'plan_code')::TEXT;
  
  -- Obter uso mensal
  v_monthly_usage := get_monthly_petitions_usage(p_user_id);
  
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
    'monthly_usage', v_monthly_usage,
    'total_usage', v_total_usage,
    'credits_balance', v_credits,
    'monthly_remaining', (v_limit_info->>'total_limit')::INTEGER - v_monthly_usage
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Conceder permissões
-- ============================================
GRANT EXECUTE ON FUNCTION get_monthly_petitions_usage(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_free_petitions_usage(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_petition_limit(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION check_user_can_create_petition(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_petition_stats(TEXT) TO authenticated, service_role;

-- ============================================
-- 7. Comentários para documentação
-- ============================================
COMMENT ON FUNCTION get_monthly_petitions_usage(TEXT) IS 'Retorna o número de petições criadas pelo usuário no mês atual';
COMMENT ON FUNCTION get_free_petitions_usage(TEXT) IS 'Retorna o número total de petições criadas pelo usuário (para plano free)';
COMMENT ON FUNCTION get_user_petition_limit(TEXT) IS 'Retorna o limite de petições do usuário, incluindo bônus de renovação';
COMMENT ON FUNCTION check_user_can_create_petition(TEXT) IS 'Verifica se o usuário pode criar uma nova petição baseado em seu plano e uso';
COMMENT ON FUNCTION get_user_petition_stats(TEXT) IS 'Retorna estatísticas detalhadas de uso de petições do usuário';

-- ============================================
-- 8. TESTES - Executar para verificar funcionamento
-- ============================================

-- Teste 1: Verificar limite de um usuário
-- SELECT get_user_petition_limit('SEU_USER_ID_AQUI');

-- Teste 2: Verificar se usuário pode criar petição
-- SELECT check_user_can_create_petition('SEU_USER_ID_AQUI');

-- Teste 3: Obter estatísticas completas
-- SELECT get_user_petition_stats('SEU_USER_ID_AQUI');

-- ============================================
-- RESUMO DAS FUNÇÕES CRIADAS:
-- ============================================
-- 1. get_monthly_petitions_usage(user_id) → Conta petições do mês
-- 2. get_free_petitions_usage(user_id) → Conta todas as petições (free)
-- 3. get_user_petition_limit(user_id) → Retorna limite com bônus
-- 4. check_user_can_create_petition(user_id) → Valida se pode criar
-- 5. get_user_petition_stats(user_id) → Estatísticas completas
-- ============================================
-- LIMITES CORRETOS:
-- Free: 1 petição (total)
-- Start: 14 petições/mês
-- Pro: 14 petições/mês + 1 bônus na renovação
-- Elite: 70 petições/mês + 3 bônus na renovação
-- ============================================

