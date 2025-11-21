-- ============================================
-- CORREÇÃO: Plano Free = 1 Petição (não 2)
-- ============================================
-- Este script corrige o limite do plano free de 2 para 1 petição

-- 1. Atualizar função get_user_petition_limit para retornar 1 para free
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

  -- Se não tem assinatura ativa, retornar limite free (1 petição)
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
    -- Plano não encontrado, retornar free (1 petição)
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

-- 2. Atualizar função check_user_can_create_petition para mensagem correta
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

-- 3. Conceder permissões novamente
GRANT EXECUTE ON FUNCTION get_user_petition_limit(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION check_user_can_create_petition(TEXT) TO authenticated, service_role;

-- 4. Comentários atualizados
COMMENT ON FUNCTION get_user_petition_limit(TEXT) IS 'Retorna o limite de petições do usuário, incluindo bônus de renovação. Free = 1 petição total';
COMMENT ON FUNCTION check_user_can_create_petition(TEXT) IS 'Verifica se o usuário pode criar uma nova petição baseado em seu plano e uso. Free = 1 petição total';

-- ============================================
-- TESTE: Verificar se a correção funcionou
-- ============================================
-- Execute este teste para verificar se o limite free agora é 1:
-- SELECT get_user_petition_limit('SEU_FIREBASE_UID_AQUI');
-- 
-- Deve retornar:
-- {
--   "plan_code": "free",
--   "base_limit": 1,
--   "bonus": 0,
--   "total_limit": 1,
--   "has_active_plan": false
-- }
-- ============================================




















