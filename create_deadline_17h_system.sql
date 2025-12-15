-- ========================================
-- SISTEMA DE PRAZO COM LIMITE 17H + TOLERÂNCIA
-- ========================================
-- Regras:
-- Start: 3 dias úteis até 17h (tolerância até 18h)
-- Pro: 2 dias úteis até 17h (tolerância até 18h)
-- Elite: mesmo dia até 17h (tolerância até 18h) - se pedido até 14h, senão próximo dia útil
-- Tempo mínimo: 3 horas para qualidade
-- Deadline definido às 18h (17h + 60min tolerância)

-- ========================================
-- 1️⃣ FUNÇÃO: Calcular Deadline com 17h
-- ========================================
CREATE OR REPLACE FUNCTION calculate_deadline_17h(
  start_timestamp TIMESTAMP WITH TIME ZONE,
  business_days INTEGER
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
  target_date DATE;  -- Renomeado de current_date (palavra reservada)
  days_added INTEGER := 0;
  start_hour INTEGER;
  final_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Extrair hora do pedido (em horário local Brasil)
  start_hour := EXTRACT(HOUR FROM start_timestamp AT TIME ZONE 'America/Sao_Paulo');
  
  -- Começar do dia do pedido
  target_date := (start_timestamp AT TIME ZONE 'America/Sao_Paulo')::DATE;
  
  -- Se business_days = 0 (Elite - mesmo dia)
  IF business_days = 0 THEN
    -- Verificar se tem 3h disponíveis hoje (pedido até 14h) e é dia útil
    IF start_hour <= 14 AND EXTRACT(DOW FROM target_date) NOT IN (0, 6) THEN
      -- Mesmo dia às 18h (17h + 60min tolerância)
      final_datetime := (target_date::TEXT || ' 18:00:00')::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
      RETURN final_datetime;
    ELSE
      -- Vai para o próximo dia útil
      business_days := 1;
    END IF;
  END IF;
  
  -- Calcular dias úteis
  WHILE days_added < business_days LOOP
    target_date := target_date + INTERVAL '1 day';
    
    -- Pular fins de semana (0 = domingo, 6 = sábado)
    IF EXTRACT(DOW FROM target_date) NOT IN (0, 6) THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;
  
  -- Definir horário 18h no último dia (17h + 60min tolerância)
  final_datetime := (target_date::TEXT || ' 18:00:00')::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
  
  RETURN final_datetime;
END;
$$;

-- ========================================
-- 2️⃣ FUNÇÃO: Obter Dias Úteis por Plano
-- ========================================
CREATE OR REPLACE FUNCTION get_business_days_by_plan(plan_code TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN CASE 
    WHEN LOWER(plan_code) = 'elite' THEN 0  -- Mesmo dia
    WHEN LOWER(plan_code) = 'pro' THEN 2    -- 2 dias úteis
    WHEN LOWER(plan_code) = 'start' THEN 3  -- 3 dias úteis
    WHEN LOWER(plan_code) = 'free' THEN 4   -- 4 dias úteis (se existir)
    ELSE 3  -- Default: 3 dias
  END;
END;
$$;

-- ========================================
-- 3️⃣ FUNÇÃO TRIGGER: Auto-calcular Deadline
-- ========================================
CREATE OR REPLACE FUNCTION auto_calculate_petition_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  client_plan TEXT;
  business_days INTEGER;
BEGIN
  -- Se deadline já foi definido manualmente, não sobrescrever
  IF NEW.deadline IS NOT NULL AND OLD.deadline IS DISTINCT FROM NEW.deadline THEN
    RETURN NEW;
  END IF;
  
  -- Buscar plano ativo do cliente
  SELECT plan_code INTO client_plan
  FROM user_subscriptions
  WHERE user_id::TEXT = NEW.client_id::TEXT
  AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Se não encontrou plano, usar 'start' como padrão
  IF client_plan IS NULL THEN
    client_plan := 'start';
  END IF;
  
  -- Obter dias úteis baseado no plano
  business_days := get_business_days_by_plan(client_plan);
  
  -- Calcular deadline
  NEW.deadline := calculate_deadline_17h(
    COALESCE(NEW.created_at, NOW()),
    business_days
  );
  
  RETURN NEW;
END;
$$;

-- ========================================
-- 4️⃣ CRIAR TRIGGER
-- ========================================
DROP TRIGGER IF EXISTS trigger_auto_calculate_deadline ON petitions;

CREATE TRIGGER trigger_auto_calculate_deadline
  BEFORE INSERT OR UPDATE ON petitions
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_petition_deadline();

-- ========================================
-- 5️⃣ TESTES
-- ========================================

-- Teste 1: Elite - pedido às 10h (deve ser mesmo dia 18h)
SELECT calculate_deadline_17h('2025-11-03 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 0) as elite_10h;
-- Resultado esperado: 2025-11-03 18:00:00-03 (ou 21:00:00 UTC)

-- Teste 2: Elite - pedido às 15h (deve ser próximo dia útil 18h)
SELECT calculate_deadline_17h('2025-11-03 15:00:00-03'::TIMESTAMP WITH TIME ZONE, 0) as elite_15h;
-- Resultado esperado: 2025-11-04 18:00:00-03 (ou 21:00:00 UTC)

-- Teste 3: Elite - pedido em Sábado (deve ser Segunda 18h)
SELECT calculate_deadline_17h('2025-11-02 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 0) as elite_sabado;
-- Resultado esperado: 2025-11-03 18:00:00-03 (ou 21:00:00 UTC)

-- Teste 4: Pro - pedido Segunda 10h (deve ser Quarta 18h)
SELECT calculate_deadline_17h('2025-11-03 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 2) as pro_segunda;
-- Resultado esperado: 2025-11-05 18:00:00-03 (ou 21:00:00 UTC)

-- Teste 5: Start - pedido Segunda 10h (deve ser Quinta 18h)
SELECT calculate_deadline_17h('2025-11-03 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 3) as start_segunda;
-- Resultado esperado: 2025-11-06 18:00:00-03 (ou 21:00:00 UTC)

-- ========================================
-- 6️⃣ ATUALIZAR PETIÇÕES EXISTENTES
-- ========================================
-- Aplicar novo cálculo de deadline em petições existentes
UPDATE petitions p
SET deadline = calculate_deadline_17h(
  p.created_at,
  get_business_days_by_plan(
    COALESCE(
      (SELECT plan_code FROM user_subscriptions WHERE user_id::TEXT = p.client_id::TEXT AND status = 'active' ORDER BY created_at DESC LIMIT 1),
      'start'
    )
  )
)
WHERE p.deadline IS NULL OR p.deadline = p.created_at;

-- Verificar resultado (deve mostrar hora_limite = 18)
SELECT
  id,
  title,
  created_at AT TIME ZONE 'America/Sao_Paulo' as criado_em,
  deadline AT TIME ZONE 'America/Sao_Paulo' as prazo_ate,
  EXTRACT(HOUR FROM deadline AT TIME ZONE 'America/Sao_Paulo') as hora_limite,
  (SELECT plan_code FROM user_subscriptions WHERE user_id::TEXT = client_id::TEXT AND status = 'active' ORDER BY created_at DESC LIMIT 1) as plano_cliente
FROM petitions
ORDER BY created_at DESC
LIMIT 10;

