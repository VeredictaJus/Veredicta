-- ========================================
-- FUNÇÃO: Declinar Petição (Aplicar Multa + Desatribuir)
-- ========================================
-- Quando o redator declina uma petição porque não conseguirá entregar a tempo:
-- 1. Aplica multa de 50% do valor da petição
-- 2. Desatribui a petição do redator
-- 3. Volta status para 'pending' (disponível para outros redatores)
-- 4. Incrementa contador de atrasos (para sistema de suspensão)

CREATE OR REPLACE FUNCTION decline_petition(petition_id UUID, writer_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  petition_value DECIMAL(12, 2);
  penalty_amount DECIMAL(12, 2);
  petition_title TEXT;
  petition_status TEXT;
  assigned_writer TEXT;
  result JSON;
BEGIN
  -- Verificar se a petição existe e pertence ao redator
  SELECT price, title, status, assigned_writer_id 
  INTO petition_value, petition_title, petition_status, assigned_writer
  FROM petitions 
  WHERE id = petition_id;
  
  IF petition_status IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Petição não encontrada');
  END IF;
  
  -- Verificar se a petição pertence ao redator
  IF assigned_writer IS NULL OR assigned_writer != writer_id THEN
    RETURN json_build_object('success', false, 'error', 'Petição não atribuída a este redator');
  END IF;
  
  -- Verificar se pode ser declinada (apenas in_progress ou assigned)
  IF petition_status NOT IN ('in_progress', 'assigned') THEN
    RETURN json_build_object('success', false, 'error', format('Petição não pode ser declinada no status: %s', petition_status));
  END IF;
  
  -- Se a petição não tem valor, usar valor padrão R$ 60,00
  IF petition_value IS NULL OR petition_value = 0 THEN
    petition_value := 60.00;
  END IF;
  
  -- Calcular multa de 50% do VALOR DA PETIÇÃO
  penalty_amount := petition_value * 0.50;
  
  -- Garantir que existe registro de saldo para o redator
  INSERT INTO writer_balance (writer_id, total_earned, penalties_total, available_balance)
  VALUES (decline_petition.writer_id, 0, 0, 0)
  ON CONFLICT (writer_id) DO NOTHING;
  
  -- Registrar penalidade
  INSERT INTO writer_penalties (writer_id, petition_id, penalty_type, amount, percentage, reason)
  VALUES (
    decline_petition.writer_id,
    petition_id,
    'declined_delivery',
    penalty_amount,
    50,
    format('Redator declinou entrega da petição "%s" (R$ %s). Multa de 50%% = R$ %s. Petição reatribuída.', 
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
  WHERE writer_balance.writer_id = decline_petition.writer_id;
  
  -- 🔄 DESATRIBUIR PETIÇÃO DO REDATOR E VOLTAR PARA PENDING
  UPDATE petitions
  SET
    assigned_writer_id = NULL,
    status = 'pending',
    updated_at = NOW()
  WHERE id = petition_id;
  
  -- ⚠️ VERIFICAR E APLICAR SUSPENSÃO PROGRESSIVA (se função existir)
  BEGIN
    PERFORM apply_writer_suspension(decline_petition.writer_id);
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Função apply_writer_suspension não encontrada.';
  END;
  
  -- Retornar resultado
  result := json_build_object(
    'success', true,
    'penalty_amount', penalty_amount,
    'petition_value', petition_value,
    'message', format('Multa de R$ %s aplicada. Petição reatribuída.', penalty_amount::TEXT)
  );
  
  RETURN result;
END;
$$;

-- ========================================
-- COMENTÁRIO DA FUNÇÃO
-- ========================================
COMMENT ON FUNCTION decline_petition IS 
'Permite que um redator decline uma petição antes do deadline. Aplica multa de 50% e reatribui a petição.';

-- ========================================
-- TESTE DA FUNÇÃO
-- ========================================
-- Para testar, execute:
-- SELECT decline_petition('petition_id_aqui', 'writer_id_aqui');



























