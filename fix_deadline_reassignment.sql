-- ========================================
-- CORRIGIR TRIGGER PARA RESPEITAR DEADLINE MANUAL
-- ========================================
-- 
-- O trigger auto_calculate_petition_deadline pode estar sobrescrevendo
-- o deadline quando fazemos atualizações manuais. Vamos melhorar a lógica
-- para garantir que quando o deadline é explicitamente alterado, ele seja respeitado.

-- Atualizar a função do trigger para ser mais robusta
CREATE OR REPLACE FUNCTION auto_calculate_petition_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  client_plan TEXT;
  business_days INTEGER;
BEGIN
  -- Se deadline já foi definido manualmente (mudou), NÃO sobrescrever
  -- Esta é a condição mais importante: se o deadline mudou, respeitar a mudança
  IF NEW.deadline IS NOT NULL AND OLD.deadline IS DISTINCT FROM NEW.deadline THEN
    -- Deadline foi alterado manualmente, respeitar
    RETURN NEW;
  END IF;
  
  -- Se o deadline não mudou mas já existe, não recalcular
  IF NEW.deadline IS NOT NULL AND OLD.deadline IS NOT DISTINCT FROM NEW.deadline THEN
    -- Deadline não mudou, manter como está
    RETURN NEW;
  END IF;
  
  -- Só calcular automaticamente se o deadline for NULL ou não foi definido
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
  
  -- Calcular deadline apenas se não foi definido
  IF NEW.deadline IS NULL THEN
    NEW.deadline := calculate_deadline_17h(
      COALESCE(NEW.created_at, NOW()),
      business_days
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- COMENTÁRIO SOBRE A LÓGICA:
-- ========================================
-- 
-- O trigger agora:
-- 1. Respeita quando o deadline é alterado manualmente (OLD != NEW)
-- 2. Mantém o deadline se não mudou (OLD = NEW)
-- 3. Só calcula automaticamente se o deadline for NULL
--
-- Isso garante que quando atualizamos o deadline via código (reatribuição, correção),
-- o trigger não vai sobrescrever o valor que definimos.












