-- ========================================
-- ATUALIZAR FUNÇÃO: Adicionar 24h ao Prazo na Reatribuição
-- ========================================
-- Quando uma petição é reatribuída após atraso, adiciona 24 horas ao prazo
-- para dar tempo ao novo redator trabalhar na petição

-- ========================================
-- 1️⃣ ATUALIZAR FUNÇÃO: apply_late_penalty
-- ========================================
CREATE OR REPLACE FUNCTION apply_late_penalty(petition_id UUID, writer_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  petition_value DECIMAL(12, 2);
  penalty_amount DECIMAL(12, 2);
  petition_title TEXT;
  suspension_status TEXT;
  current_deadline TIMESTAMP WITH TIME ZONE;
  new_deadline TIMESTAMP WITH TIME ZONE;
  old_status TEXT;
  was_approved BOOLEAN;
  current_completed_count INTEGER;
BEGIN
  -- Buscar valor, título, deadline e status atual da petição
  SELECT price, title, deadline, status 
  INTO petition_value, petition_title, current_deadline, old_status
  FROM petitions 
  WHERE id = petition_id;
  
  -- Verificar se a petição estava aprovada (precisa decrementar completed_petitions)
  was_approved := (old_status = 'approved');
  
  -- Se a petição não tem valor, usar valor padrão R$ 60,00
  IF petition_value IS NULL OR petition_value = 0 THEN
    petition_value := 60.00;
  END IF;
  
  -- Calcular multa de 50% do VALOR DA PETIÇÃO
  penalty_amount := petition_value * 0.50;
  
  -- Garantir que existe registro de saldo para o redator
  INSERT INTO writer_balance (writer_id, total_earned, penalties_total, available_balance)
  VALUES (apply_late_penalty.writer_id, 0, 0, 0)
  ON CONFLICT (writer_id) DO NOTHING;
  
  -- Registrar penalidade
  INSERT INTO writer_penalties (writer_id, petition_id, penalty_type, amount, percentage, reason)
  VALUES (
    apply_late_penalty.writer_id,
    petition_id,
    'late_delivery',
    penalty_amount,
    50,
    format('Atraso na entrega da petição "%s" (R$ %s). Multa de 50%% = R$ %s. Petição reatribuída com prazo estendido em 24h.', 
      petition_title, 
      petition_value::TEXT, 
      penalty_amount::TEXT
    )
  );
  
  -- Atualizar saldo (descontar multa)
  UPDATE writer_balance
  SET 
    penalties_total = penalties_total + penalty_amount,
    available_balance = GREATEST(0, available_balance - penalty_amount),
    updated_at = NOW()
  WHERE writer_balance.writer_id = apply_late_penalty.writer_id;
  
  -- ⏰ CALCULAR NOVO DEADLINE: Adicionar 24 horas ao deadline atual
  -- Se não tiver deadline, usar NOW() + 24h
  IF current_deadline IS NULL THEN
    new_deadline := NOW() + INTERVAL '24 hours';
  ELSE
    new_deadline := current_deadline + INTERVAL '24 hours';
  END IF;
  
  -- 🔄 DESATRIBUIR PETIÇÃO DO REDATOR, VOLTAR PARA PENDING E ATUALIZAR DEADLINE
  UPDATE petitions
  SET
    assigned_writer_id = NULL,
    status = 'pending',
    deadline = new_deadline,  -- ✅ NOVO: Adicionar 24h ao prazo
    updated_at = NOW()
  WHERE id = petition_id;
  
  -- 📊 RECALCULAR completed_petitions (garantir que está sempre correto)
  -- Recalcular contador baseado nas petições realmente aprovadas e atribuídas ao redator
  -- Isso garante que se a petição estava aprovada, o contador seja decrementado
  SELECT COUNT(*) INTO current_completed_count
  FROM petitions
  WHERE status = 'approved'
    AND assigned_writer_id = apply_late_penalty.writer_id;
  
  -- Atualizar contador com o valor correto
  UPDATE profiles_v2
  SET 
    completed_petitions = GREATEST(0, current_completed_count), -- Não permitir negativo
    updated_at = NOW()
  WHERE firebase_uid = apply_late_penalty.writer_id;
  
  IF was_approved THEN
    RAISE NOTICE '📊 completed_petitions recalculado para writer % (petição estava aprovada, agora: %)', 
      apply_late_penalty.writer_id, current_completed_count;
  ELSE
    RAISE NOTICE '📊 completed_petitions recalculado para writer % (agora: %)', 
      apply_late_penalty.writer_id, current_completed_count;
  END IF;
  
  -- ⚠️ VERIFICAR E APLICAR SUSPENSÃO PROGRESSIVA
  BEGIN
    suspension_status := apply_writer_suspension(apply_late_penalty.writer_id);
  EXCEPTION WHEN OTHERS THEN
    suspension_status := 'Função apply_writer_suspension não encontrada';
  END;
  
  -- Log
  RAISE NOTICE '🚨 Multa aplicada: Petição R$ % → Multa R$ % (50%%) para writer %. Petição desatribuída. Prazo estendido em 24h (novo deadline: %). %', 
    petition_value, penalty_amount, apply_late_penalty.writer_id, new_deadline, suspension_status;
END;
$$;

-- ========================================
-- 2️⃣ ATUALIZAR FUNÇÃO: check_and_apply_late_penalties
-- ========================================
-- Garantir que também adiciona 24h quando processar automaticamente
CREATE OR REPLACE FUNCTION check_and_apply_late_penalties()
RETURNS TABLE(writer_id TEXT, petition_id UUID, penalty_applied DECIMAL)
LANGUAGE plpgsql
AS $$
DECLARE
  late_petition RECORD;
  already_penalized BOOLEAN;
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
    AND p.status IN ('in_progress', 'assigned', 'pending_review')
    AND p.deadline < NOW()
    ORDER BY p.deadline ASC
  LOOP
    -- Verificar se já aplicou multa para esta petição
    SELECT EXISTS(
      SELECT 1 FROM writer_penalties
      WHERE petition_id = late_petition.id
      AND penalty_type = 'late_delivery'
    ) INTO already_penalized;
    
    -- Se ainda não aplicou multa OU se a petição ainda está atribuída, aplicar
    IF NOT already_penalized OR EXISTS (
      SELECT 1 FROM petitions 
      WHERE id = late_petition.id 
      AND assigned_writer_id IS NOT NULL
    ) THEN
      PERFORM apply_late_penalty(late_petition.id, late_petition.assigned_writer_id);
      
      RETURN QUERY SELECT 
        late_petition.assigned_writer_id,
        late_petition.id,
        COALESCE(
          (SELECT amount FROM writer_penalties 
           WHERE petition_id = late_petition.id 
           AND penalty_type = 'late_delivery'
           ORDER BY applied_at DESC LIMIT 1),
          0
        );
    END IF;
  END LOOP;
END;
$$;

-- ========================================
-- 3️⃣ TESTAR A FUNÇÃO ATUALIZADA
-- ========================================
-- Ver petições atrasadas antes de aplicar
SELECT 
  p.id,
  p.display_id,
  p.title,
  p.assigned_writer_id,
  p.status,
  p.deadline as deadline_atual,
  p.deadline + INTERVAL '24 hours' as novo_deadline_esperado,
  NOW() as agora
FROM petitions p
WHERE p.assigned_writer_id IS NOT NULL
  AND p.status IN ('in_progress', 'assigned', 'pending_review')
  AND p.deadline < NOW()
ORDER BY p.deadline ASC;

-- ========================================
-- 4️⃣ APLICAR CORREÇÃO MANUAL NA PETIÇÃO ESPECÍFICA
-- ========================================
-- Se quiser aplicar na petição PET-2025-0007 que já foi processada:
UPDATE petitions
SET 
  deadline = deadline + INTERVAL '24 hours',
  updated_at = NOW()
WHERE display_id = 'PET-2025-0007'
  AND assigned_writer_id IS NULL
  AND status IN ('pending', 'available');

-- Verificar resultado
SELECT 
  id,
  display_id,
  title,
  status,
  deadline,
  deadline - INTERVAL '24 hours' as deadline_anterior,
  updated_at
FROM petitions
WHERE display_id = 'PET-2025-0007';

-- ========================================
-- 5️⃣ VERIFICAR FUNÇÕES ATUALIZADAS
-- ========================================
SELECT 
  proname as funcao,
  CASE 
    WHEN proname = 'apply_late_penalty' THEN '✅ Função de aplicar multa (com +24h no prazo)'
    WHEN proname = 'check_and_apply_late_penalties' THEN '✅ Função de verificação automática'
    ELSE 'Outra função'
  END as descricao
FROM pg_proc
WHERE proname IN ('apply_late_penalty', 'check_and_apply_late_penalties');

