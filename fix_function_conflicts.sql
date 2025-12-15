-- ========================================
-- 🔧 SCRIPT: CORRIGIR CONFLITOS DE FUNÇÕES
-- ========================================
-- Este script remove funções existentes que podem ter tipos de retorno diferentes

-- 1️⃣ REMOVER FUNÇÕES EXISTENTES (se existirem)
DROP FUNCTION IF EXISTS expire_cancelled_subscriptions();
DROP FUNCTION IF EXISTS calculate_subscription_expiry(TEXT, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS cancel_subscription_with_grace_period(TEXT, TEXT);
DROP FUNCTION IF EXISTS reactivate_cancelled_subscription(TEXT, TEXT);
DROP FUNCTION IF EXISTS check_free_plan_usage(TEXT);
DROP FUNCTION IF EXISTS get_subscription_status(TEXT);

-- 2️⃣ VERIFICAR SE AS COLUNAS EXISTEM ANTES DE ADICIONAR
DO $$
BEGIN
    -- Adicionar coluna cancelled_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'cancelled_at') THEN
        ALTER TABLE user_subscriptions ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    END IF;
    
    -- Adicionar coluna expires_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'expires_at') THEN
        ALTER TABLE user_subscriptions ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    END IF;
    
    -- Adicionar coluna cancel_at_period_end se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_subscriptions' 
                   AND column_name = 'cancel_at_period_end') THEN
        ALTER TABLE user_subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3️⃣ ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON COLUMN user_subscriptions.cancelled_at IS 'Data em que o plano foi cancelado pelo usuário';
COMMENT ON COLUMN user_subscriptions.expires_at IS 'Data em que o acesso ao plano expira (fim do período pago)';
COMMENT ON COLUMN user_subscriptions.cancel_at_period_end IS 'Se true, o plano será cancelado automaticamente no fim do período';

-- 4️⃣ CRIAR FUNÇÃO PARA CALCULAR DATA DE EXPIRAÇÃO
CREATE OR REPLACE FUNCTION calculate_subscription_expiry(
  p_plan_name TEXT,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  v_days_to_add INTEGER;
BEGIN
  -- Definir dias de validade de acordo com o plano
  CASE p_plan_name
    WHEN 'Start' THEN v_days_to_add := 30;  -- 30 dias
    WHEN 'Pro' THEN v_days_to_add := 60;    -- 60 dias
    WHEN 'Elite' THEN v_days_to_add := 90;  -- 90 dias
    WHEN 'Free' THEN v_days_to_add := 7;    -- 7 dias (apenas para a petição gratuita)
    ELSE v_days_to_add := 30;                -- Padrão: 30 dias
  END CASE;
  
  RETURN p_start_date + (v_days_to_add || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- 5️⃣ CRIAR FUNÇÃO PARA CANCELAR PLANO COM PERÍODO DE CARÊNCIA
CREATE OR REPLACE FUNCTION cancel_subscription_with_grace_period(
  p_user_id TEXT,
  p_plan_code TEXT
) RETURNS JSON AS $$
DECLARE
  v_subscription RECORD;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_days_remaining INTEGER;
  v_result JSON;
BEGIN
  -- Buscar assinatura ativa do usuário
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id 
    AND plan_code = p_plan_code 
    AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Assinatura ativa não encontrada para este usuário e plano.'
    );
  END IF;
  
  -- Calcular data de expiração baseada no plano
  v_expires_at := calculate_subscription_expiry(p_plan_code, NOW());
  
  -- Calcular dias restantes
  v_days_remaining := EXTRACT(DAYS FROM (v_expires_at - NOW()))::INTEGER;
  
  -- Atualizar assinatura com cancelamento e período de carência
  UPDATE user_subscriptions
  SET 
    cancelled_at = NOW(),
    expires_at = v_expires_at,
    cancel_at_period_end = true,
    status = 'cancelled',
    updated_at = NOW()
  WHERE user_id = p_user_id 
    AND plan_code = p_plan_code 
    AND status = 'active';
  
  -- Verificar se a atualização foi bem-sucedida
  IF FOUND THEN
    v_result := json_build_object(
      'success', true,
      'message', 'Plano cancelado com sucesso. Você ainda pode usá-lo até o fim do período pago.',
      'expires_at', v_expires_at,
      'days_remaining', v_days_remaining
    );
  ELSE
    v_result := json_build_object(
      'success', false,
      'message', 'Erro ao cancelar assinatura. Tente novamente.'
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 6️⃣ CRIAR FUNÇÃO PARA REATIVAR PLANO CANCELADO
CREATE OR REPLACE FUNCTION reactivate_cancelled_subscription(
  p_user_id TEXT,
  p_plan_code TEXT
) RETURNS JSON AS $$
DECLARE
  v_subscription RECORD;
  v_result JSON;
BEGIN
  -- Buscar assinatura cancelada do usuário
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id 
    AND plan_code = p_plan_code 
    AND status = 'cancelled'
    AND cancel_at_period_end = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Assinatura cancelada não encontrada ou já expirada.'
    );
  END IF;
  
  -- Reativar assinatura
  UPDATE user_subscriptions
  SET 
    cancelled_at = NULL,
    expires_at = NULL,
    cancel_at_period_end = false,
    status = 'active',
    updated_at = NOW()
  WHERE user_id = p_user_id 
    AND plan_code = p_plan_code 
    AND status = 'cancelled';
  
  -- Verificar se a reativação foi bem-sucedida
  IF FOUND THEN
    v_result := json_build_object(
      'success', true,
      'message', 'Plano reativado com sucesso. Sua assinatura continuará normalmente.'
    );
  ELSE
    v_result := json_build_object(
      'success', false,
      'message', 'Erro ao reativar assinatura. Tente novamente.'
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 7️⃣ CRIAR FUNÇÃO PARA EXPIRAR ASSINATURAS CANCELADAS (PARA CRON JOB)
CREATE OR REPLACE FUNCTION expire_cancelled_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  -- Atualizar assinaturas canceladas que passaram da data de expiração
  UPDATE user_subscriptions
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE status = 'cancelled'
    AND cancel_at_period_end = true
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
  
  -- Retornar número de assinaturas expiradas
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- 8️⃣ CRIAR FUNÇÃO PARA VERIFICAR SE USUÁRIO JÁ USOU PLANO FREE
CREATE OR REPLACE FUNCTION check_free_plan_usage(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_has_used_free BOOLEAN := false;
  v_user_document TEXT;
BEGIN
  -- Buscar documento do usuário (CPF/CNPJ)
  SELECT document INTO v_user_document
  FROM user_profiles
  WHERE firebase_uid = p_user_id;
  
  -- Se não tem documento, permitir (usuário pode adicionar depois)
  IF v_user_document IS NULL OR v_user_document = '' THEN
    RETURN json_build_object(
      'can_use_free', true,
      'reason', 'no_document_registered'
    );
  END IF;
  
  -- Verificar se já usou plano Free (mesmo CPF/CNPJ)
  SELECT EXISTS(
    SELECT 1 
    FROM user_subscriptions us
    JOIN user_profiles up ON us.user_id = up.firebase_uid
    WHERE up.document = v_user_document 
      AND us.plan_code = 'Free'
      AND us.status IN ('active', 'cancelled', 'expired')
  ) INTO v_has_used_free;
  
  IF v_has_used_free THEN
    RETURN json_build_object(
      'can_use_free', false,
      'reason', 'already_used_free_plan',
      'message', 'Você já utilizou sua petição gratuita com este CPF/CNPJ. Escolha um plano pago para continuar.'
    );
  ELSE
    RETURN json_build_object(
      'can_use_free', true,
      'reason', 'never_used_free_plan'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 9️⃣ CRIAR FUNÇÃO PARA OBTER STATUS DETALHADO DA ASSINATURA
CREATE OR REPLACE FUNCTION get_subscription_status(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_subscription RECORD;
  v_result JSON;
BEGIN
  -- Buscar assinatura mais recente do usuário
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'has_subscription', false,
      'plan_code', 'free'
    );
  END IF;
  
  -- Montar resultado baseado no status da assinatura
  IF v_subscription.status = 'active' THEN
    v_result := json_build_object(
      'has_subscription', true,
      'plan_code', v_subscription.plan_code,
      'status', v_subscription.status,
      'is_cancelled', false,
      'can_reactivate', false
    );
  ELSIF v_subscription.status = 'cancelled' AND v_subscription.cancel_at_period_end = true THEN
    v_result := json_build_object(
      'has_subscription', true,
      'plan_code', v_subscription.plan_code,
      'status', v_subscription.status,
      'is_cancelled', true,
      'cancelled_at', v_subscription.cancelled_at,
      'expires_at', v_subscription.expires_at,
      'days_remaining', EXTRACT(DAYS FROM (v_subscription.expires_at - NOW()))::INTEGER,
      'can_reactivate', v_subscription.expires_at > NOW()
    );
  ELSE
    v_result := json_build_object(
      'has_subscription', true,
      'plan_code', v_subscription.plan_code,
      'status', v_subscription.status,
      'is_cancelled', false,
      'can_reactivate', false
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 🔟 CRIAR ÍNDICES PARA MELHOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cancelled ON user_subscriptions(cancelled_at) WHERE cancelled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON user_subscriptions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cancel_at_end ON user_subscriptions(cancel_at_period_end) WHERE cancel_at_period_end = true;

-- ========================================
-- ✅ SCRIPT CONCLUÍDO
-- ========================================
-- Agora você pode:
-- 1. Cancelar planos com período de carência usando cancel_subscription_with_grace_period()
-- 2. Reativar planos cancelados usando reactivate_cancelled_subscription()
-- 3. Verificar status detalhado usando get_subscription_status()
-- 4. Verificar uso do plano Free usando check_free_plan_usage()
-- 5. Expirar assinaturas automaticamente usando expire_cancelled_subscriptions()























