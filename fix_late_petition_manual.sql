-- ========================================
-- CORRIGIR PETIÇÃO ATRASADA MANUALMENTE
-- ========================================
-- Use este script para aplicar multa e desatribuir uma petição atrasada
-- que não foi processada automaticamente

-- ========================================
-- 1️⃣ VERIFICAR PETIÇÕES ATRASADAS
-- ========================================
-- Execute primeiro para ver quais petições estão atrasadas:
SELECT 
  p.id,
  p.display_id,
  p.title,
  p.assigned_writer_id,
  p.status,
  p.deadline,
  p.price,
  NOW() as agora,
  p.deadline < NOW() as esta_atrasada,
  EXTRACT(EPOCH FROM (NOW() - p.deadline)) / 3600 as horas_atraso
FROM petitions p
WHERE p.assigned_writer_id IS NOT NULL
  AND p.status IN ('in_progress', 'assigned', 'pending_review')
  AND p.deadline < NOW()
ORDER BY p.deadline ASC;

-- ========================================
-- 2️⃣ APLICAR MULTA E DESATRIBUIR PETIÇÃO ESPECÍFICA
-- ========================================
-- Substitua 'PETITION_ID_AQUI' pelo ID da petição atrasada
-- Exemplo: '123e4567-e89b-12d3-a456-426614174000'

DO $$
DECLARE
  v_petition_id UUID := 'PETITION_ID_AQUI'; -- ⚠️ SUBSTITUA PELO ID DA PETIÇÃO
  v_writer_id TEXT;
  v_petition_value DECIMAL(12, 2);
  v_penalty_amount DECIMAL(12, 2);
  v_petition_title TEXT;
  v_already_penalized BOOLEAN;
BEGIN
  -- Buscar dados da petição
  SELECT 
    assigned_writer_id,
    price,
    title
  INTO 
    v_writer_id,
    v_petition_value,
    v_petition_title
  FROM petitions
  WHERE id = v_petition_id;
  
  -- Verificar se petição existe e está atribuída
  IF v_writer_id IS NULL THEN
    RAISE EXCEPTION 'Petição não encontrada ou não está atribuída a um redator';
  END IF;
  
  -- Verificar se já aplicou multa
  SELECT EXISTS(
    SELECT 1 FROM writer_penalties
    WHERE petition_id = v_petition_id
    AND penalty_type = 'late_delivery'
  ) INTO v_already_penalized;
  
  IF v_already_penalized THEN
    RAISE NOTICE '⚠️ Multa já foi aplicada para esta petição anteriormente';
  ELSE
    -- Se a petição não tem valor, usar valor padrão R$ 60,00
    IF v_petition_value IS NULL OR v_petition_value = 0 THEN
      v_petition_value := 60.00;
    END IF;
    
    -- Calcular multa de 50% do VALOR DA PETIÇÃO
    v_penalty_amount := v_petition_value * 0.50;
    
    -- Garantir que existe registro de saldo para o redator
    INSERT INTO writer_balance (writer_id, total_earned, penalties_total, available_balance)
    VALUES (v_writer_id, 0, 0, 0)
    ON CONFLICT (writer_id) DO NOTHING;
    
    -- Registrar penalidade
    INSERT INTO writer_penalties (writer_id, petition_id, penalty_type, amount, percentage, reason)
    VALUES (
      v_writer_id,
      v_petition_id,
      'late_delivery',
      v_penalty_amount,
      50,
      format('Atraso na entrega da petição "%s" (R$ %s). Multa de 50%% = R$ %s. Petição reatribuída.', 
        v_petition_title, 
        v_petition_value::TEXT, 
        v_penalty_amount::TEXT
      )
    );
    
    -- Atualizar saldo (descontar multa)
    UPDATE writer_balance
    SET 
      penalties_total = penalties_total + v_penalty_amount,
      available_balance = GREATEST(0, available_balance - v_penalty_amount), -- Não permitir saldo negativo
      updated_at = NOW()
    WHERE writer_id = v_writer_id;
    
    RAISE NOTICE '✅ Multa de R$ % aplicada ao redator %', v_penalty_amount, v_writer_id;
  END IF;
  
  -- 🔄 DESATRIBUIR PETIÇÃO DO REDATOR E VOLTAR PARA PENDING
  UPDATE petitions
  SET
    assigned_writer_id = NULL,
    status = 'pending',
    updated_at = NOW()
  WHERE id = v_petition_id;
  
  RAISE NOTICE '✅ Petição % desatribuída e voltou para status "pending"', v_petition_id;
  
  -- ⚠️ VERIFICAR E APLICAR SUSPENSÃO PROGRESSIVA (se a função existir)
  BEGIN
    PERFORM apply_writer_suspension(v_writer_id);
    RAISE NOTICE '✅ Suspensão verificada para o redator %', v_writer_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Função apply_writer_suspension não encontrada ou erro: %', SQLERRM;
  END;
  
END $$;

-- ========================================
-- 3️⃣ APLICAR PARA TODAS AS PETIÇÕES ATRASADAS
-- ========================================
-- Use esta função para aplicar multa e desatribuir TODAS as petições atrasadas de uma vez

SELECT * FROM check_and_apply_late_penalties();

-- ========================================
-- 4️⃣ VERIFICAR RESULTADO
-- ========================================
-- Verificar se a petição foi desatribuída:
SELECT 
  id,
  display_id,
  title,
  assigned_writer_id,
  status,
  deadline
FROM petitions
WHERE id = 'PETITION_ID_AQUI'; -- ⚠️ SUBSTITUA PELO ID DA PETIÇÃO

-- Verificar multa aplicada:
SELECT 
  wp.*,
  p.title as petition_title,
  p.display_id
FROM writer_penalties wp
LEFT JOIN petitions p ON wp.petition_id = p.id
WHERE wp.petition_id = 'PETITION_ID_AQUI' -- ⚠️ SUBSTITUA PELO ID DA PETIÇÃO
ORDER BY wp.applied_at DESC;

-- Verificar saldo do redator:
SELECT 
  writer_id,
  total_earned,
  penalties_total,
  available_balance,
  updated_at
FROM writer_balance
WHERE writer_id = 'WRITER_ID_AQUI'; -- ⚠️ SUBSTITUA PELO ID DO REDATOR




