-- ========================================
-- ATUALIZAR SISTEMA DE MULTAS
-- ========================================
-- Adiciona lógica para DESATRIBUIR petição atrasada
-- e torná-la disponível para outros redatores
--
-- ⚠️ ATENÇÃO: Execute PRIMEIRO o arquivo create_suspension_system.sql
--            para criar a função apply_writer_suspension()

-- ========================================
-- 1️⃣ ATUALIZAR FUNÇÃO: Aplicar Multa + Desatribuir Petição
-- ========================================
CREATE OR REPLACE FUNCTION apply_late_penalty(petition_id UUID, writer_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  petition_value DECIMAL(12, 2);
  penalty_amount DECIMAL(12, 2);
  petition_title TEXT;
BEGIN
  -- Buscar valor e título da petição
  SELECT price, title INTO petition_value, petition_title 
  FROM petitions 
  WHERE id = petition_id;
  
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
    format('Atraso na entrega da petição "%s" (R$ %s). Multa de 50%% = R$ %s. Petição reatribuída.', 
      petition_title, 
      petition_value::TEXT, 
      penalty_amount::TEXT
    )
  );
  
  -- Atualizar saldo (descontar multa)
  UPDATE writer_balance
  SET 
    penalties_total = penalties_total + penalty_amount,
    available_balance = available_balance - penalty_amount,
    updated_at = NOW()
  WHERE writer_balance.writer_id = apply_late_penalty.writer_id;
  
  -- 🔄 DESATRIBUIR PETIÇÃO DO REDATOR E VOLTAR PARA PENDING
  UPDATE petitions
  SET
    assigned_writer_id = NULL,
    status = 'pending',
    updated_at = NOW()
  WHERE id = petition_id;
  
  -- ⚠️ VERIFICAR E APLICAR SUSPENSÃO PROGRESSIVA (se função existir)
  BEGIN
    PERFORM apply_writer_suspension(apply_late_penalty.writer_id);
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Função apply_writer_suspension não encontrada. Execute create_suspension_system.sql primeiro.';
  END;
  
  -- Log
  RAISE NOTICE '🚨 Multa aplicada: Petição R$ % → Multa R$ % (50%%) para writer %. Petição desatribuída e voltou para pending.', 
    petition_value, penalty_amount, apply_late_penalty.writer_id;
END;
$$;

-- ========================================
-- 2️⃣ TESTAR A NOVA FUNÇÃO
-- ========================================

-- Ver petições atrasadas que serão processadas
SELECT
  p.id,
  p.display_id,
  p.title,
  p.assigned_writer_id,
  p.status,
  p.deadline,
  NOW() - p.deadline as tempo_atrasado
FROM petitions p
WHERE p.assigned_writer_id IS NOT NULL
  AND p.status IN ('in_progress', 'assigned')
  AND p.deadline < NOW()
ORDER BY p.deadline ASC;

-- ========================================
-- 3️⃣ EXECUTAR VERIFICAÇÃO MANUAL (TESTE)
-- ========================================
-- Descomente para executar:
-- SELECT * FROM check_and_apply_late_penalties();

-- ========================================
-- 4️⃣ VERIFICAR RESULTADO
-- ========================================

-- Ver petições que voltaram para pending após multa
SELECT
  p.id,
  p.display_id,
  p.title,
  p.status,
  p.assigned_writer_id,
  wp.amount as multa_aplicada,
  wp.applied_at as data_multa
FROM petitions p
LEFT JOIN writer_penalties wp ON p.id = wp.petition_id
WHERE wp.applied_at > NOW() - INTERVAL '1 hour'
ORDER BY wp.applied_at DESC;

-- Ver multas aplicadas recentemente
SELECT 
  wp.writer_id,
  wp.amount as multa,
  wp.reason,
  wp.applied_at,
  p.title as petition_title,
  p.status as status_atual,
  p.assigned_writer_id as redator_atual
FROM writer_penalties wp
LEFT JOIN petitions p ON wp.petition_id = p.id
ORDER BY wp.applied_at DESC
LIMIT 10;

-- ========================================
-- 5️⃣ LÓGICA COMPLETA DO FLUXO
-- ========================================
-- 1. Petição atrasada (deadline passou)
-- 2. Sistema aplica multa de 50% do valor ao redator
-- 3. Petição é DESATRIBUÍDA do redator (assigned_writer_id = NULL)
-- 4. Status volta para 'pending' (disponível para outros redatores)
-- 5. Outro redator pode pegar a petição no dashboard
-- 6. Cliente recebe a petição com novo redator

-- ========================================
-- 6️⃣ NOTIFICAÇÃO (OPCIONAL - IMPLEMENTAR NO FRONTEND)
-- ========================================
-- Quando petição for reatribuída, você pode:
-- 1. Enviar notificação ao cliente informando o atraso
-- 2. Enviar notificação ao redator sobre a multa
-- 3. Enviar notificação aos redatores que a petição está disponível novamente

