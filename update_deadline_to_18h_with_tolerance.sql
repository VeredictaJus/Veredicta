-- ========================================
-- ATUALIZAR SISTEMA DE PRAZO PARA 18H + TOLERÂNCIA 60MIN
-- ========================================
-- Novo padrão:
-- - Entregas até às 18h (horário oficial)
-- - Tolerância de 60 minutos (até 19h)
-- - Após 19h, a petição será considerada ATRASADA
-- 
-- ⚠️ IMPORTANTE: Execute este script no Supabase SQL Editor

-- ========================================
-- 1️⃣ ATUALIZAR FUNÇÃO: Calcular Deadline (já está em 18h, mas vamos garantir)
-- ========================================
CREATE OR REPLACE FUNCTION calculate_deadline_18h(
  start_timestamp TIMESTAMP WITH TIME ZONE,
  business_days INTEGER
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
  v_target_date DATE;
  days_added INTEGER := 0;
  start_hour INTEGER;
  final_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Extrair hora do pedido (em horário local Brasil)
  start_hour := EXTRACT(HOUR FROM start_timestamp AT TIME ZONE 'America/Sao_Paulo');
  
  -- Começar do dia do pedido
  v_target_date := (start_timestamp AT TIME ZONE 'America/Sao_Paulo')::DATE;
  
  -- Se business_days = 0 (Elite - mesmo dia)
  IF business_days = 0 THEN
    -- Verificar se tem 3h disponíveis hoje (pedido até 14h) e é dia útil
    IF start_hour <= 14 AND EXTRACT(DOW FROM v_target_date) NOT IN (0, 6) THEN
      -- Mesmo dia às 18h (horário oficial de entrega)
      final_datetime := (v_target_date::TEXT || ' 18:00:00')::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
      RETURN final_datetime;
    ELSE
      -- Vai para o próximo dia útil
      business_days := 1;
    END IF;
  END IF;
  
  -- Calcular dias úteis
  WHILE days_added < business_days LOOP
    v_target_date := v_target_date + INTERVAL '1 day';
    
    -- Pular fins de semana (0 = domingo, 6 = sábado)
    IF EXTRACT(DOW FROM v_target_date) NOT IN (0, 6) THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;
  
  -- Definir horário 18h no último dia (horário oficial de entrega)
  final_datetime := (v_target_date::TEXT || ' 18:00:00')::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
  
  RETURN final_datetime;
END;
$$;

-- Remover função antiga se existir (simples, sem bloco DO)
DROP FUNCTION IF EXISTS calculate_deadline_17h(TIMESTAMP WITH TIME ZONE, INTEGER);

-- ========================================
-- 2️⃣ ATUALIZAR FUNÇÃO: Verificar se Petição Está Atrasada (com tolerância)
-- ========================================
CREATE OR REPLACE FUNCTION is_petition_late(petition_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  petition_deadline TIMESTAMP WITH TIME ZONE;
  petition_status TEXT;
  delivery_time TIMESTAMP WITH TIME ZONE;
  deadline_with_tolerance TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Buscar dados da petição
  SELECT deadline, status, updated_at INTO petition_deadline, petition_status, delivery_time
  FROM petitions
  WHERE id = petition_id;
  
  -- Se não encontrou, não está atrasada
  IF petition_deadline IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calcular deadline com tolerância (18h + 60 minutos = 19h)
  deadline_with_tolerance := petition_deadline + INTERVAL '60 minutes';
  
  -- Se já foi concluída/entregue, verificar se entregou após o deadline com tolerância
  IF petition_status IN ('completed', 'delivered', 'approved') THEN
    RETURN delivery_time > deadline_with_tolerance;
  END IF;
  
  -- Se ainda está em andamento, verificar se já passou do deadline com tolerância
  IF petition_status IN ('in_progress', 'assigned') THEN
    RETURN NOW() > deadline_with_tolerance;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- ========================================
-- 3️⃣ ATUALIZAR FUNÇÃO: Verificar e Aplicar Multas (com tolerância)
-- ========================================
CREATE OR REPLACE FUNCTION check_and_apply_late_penalties()
RETURNS TABLE(writer_id TEXT, petition_id UUID, penalty_applied DECIMAL)
LANGUAGE plpgsql
AS $$
DECLARE
  late_petition RECORD;
  already_penalized BOOLEAN;
  deadline_with_tolerance TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Buscar petições atrasadas que ainda não têm status final
  FOR late_petition IN
    SELECT 
      p.id,
      p.assigned_writer_id,
      p.title,
      p.deadline,
      p.status
    FROM petitions p
    WHERE p.assigned_writer_id IS NOT NULL
    AND p.status IN ('in_progress', 'assigned')
    AND p.deadline IS NOT NULL
  LOOP
    -- Calcular deadline com tolerância (18h + 60 minutos = 19h)
    deadline_with_tolerance := late_petition.deadline + INTERVAL '60 minutes';
    
    -- Verificar se passou do deadline com tolerância (19h)
    IF NOW() <= deadline_with_tolerance THEN
      CONTINUE; -- Ainda está dentro da tolerância, pular
    END IF;
    
    -- Verificar se já aplicou multa para esta petição
    SELECT EXISTS(
      SELECT 1 FROM writer_penalties
      WHERE petition_id = late_petition.id
      AND penalty_type = 'late_delivery'
    ) INTO already_penalized;
    
    -- Se ainda não aplicou multa, aplicar
    IF NOT already_penalized THEN
      PERFORM apply_late_penalty(late_petition.id, late_petition.assigned_writer_id);
      
      RETURN QUERY SELECT 
        late_petition.assigned_writer_id,
        late_petition.id,
        (SELECT amount FROM writer_penalties WHERE petition_id = late_petition.id ORDER BY applied_at DESC LIMIT 1);
    END IF;
  END LOOP;
END;
$$;

-- ========================================
-- 4️⃣ ATUALIZAR TRIGGER: Auto-calcular Deadline
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
  
  -- Calcular deadline usando nova função
  NEW.deadline := calculate_deadline_18h(
    COALESCE(NEW.created_at, NOW()),
    business_days
  );
  
  RETURN NEW;
END;
$$;

-- ========================================
-- 5️⃣ ATUALIZAR COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================
COMMENT ON FUNCTION calculate_deadline_18h IS 
'Calcula o deadline de entrega para 18h (horário oficial). Tolerância de 60 minutos até 19h.';

COMMENT ON FUNCTION is_petition_late IS 
'Verifica se a petição está atrasada considerando tolerância de 60 minutos (deadline + 1h = 19h).';

COMMENT ON FUNCTION check_and_apply_late_penalties IS 
'Verifica e aplica multas em petições que passaram do deadline com tolerância (após 19h).';

-- ========================================
-- 6️⃣ VERIFICAR RESULTADO
-- ========================================
-- Verificar se as funções foram atualizadas
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname IN ('calculate_deadline_18h', 'is_petition_late', 'check_and_apply_late_penalties')
ORDER BY proname;

-- ========================================
-- 7️⃣ TESTE: Verificar cálculo de deadline
-- ========================================
-- Teste 1: Elite - pedido às 10h (deve ser mesmo dia 18h)
SELECT 
  calculate_deadline_18h('2025-11-03 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 0) as deadline,
  calculate_deadline_18h('2025-11-03 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 0) + INTERVAL '60 minutes' as deadline_com_tolerancia;
-- Resultado esperado: deadline = 18h, deadline_com_tolerancia = 19h

-- Teste 2: Pro - pedido Segunda 10h (deve ser Quarta 18h)
SELECT 
  calculate_deadline_18h('2025-11-03 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 2) as deadline,
  calculate_deadline_18h('2025-11-03 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 2) + INTERVAL '60 minutes' as deadline_com_tolerancia;
-- Resultado esperado: deadline = 18h, deadline_com_tolerancia = 19h

-- ========================================
-- 8️⃣ NOTA SOBRE NOTIFICAÇÕES
-- ========================================
-- O sistema de notificações (setup_deadline_notifications_cron.sql) já está
-- configurado corretamente para enviar alertas 1h antes do deadline (às 17h).
-- Não é necessário alterar esse sistema, pois ele verifica deadlines próximos
-- dinamicamente (55-65 minutos antes), o que funciona perfeitamente com o
-- novo padrão de 18h.

-- ========================================
-- ✅ CONCLUSÃO
-- ========================================
-- O sistema agora está configurado para:
-- 1. Calcular deadlines às 18h (horário oficial de entrega)
-- 2. Considerar tolerância de 60 minutos (até 19h)
-- 3. Aplicar multas apenas após 19h (após a tolerância)
-- 4. Verificar atrasos considerando a tolerância de 60 minutos
-- 5. Notificações automáticas às 17h (1h antes do deadline de 18h)
--
-- ⚠️ IMPORTANTE: Execute este script no Supabase SQL Editor para aplicar as mudanças.

