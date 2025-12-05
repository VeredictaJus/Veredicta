-- ========================================
-- VERIFICAR E CORRIGIR SISTEMA DE MULTAS
-- ========================================
-- Este script verifica se o sistema está funcionando e corrige problemas

-- ========================================
-- 1️⃣ VERIFICAR SE AS FUNÇÕES EXISTEM
-- ========================================
SELECT 
  proname as funcao,
  CASE 
    WHEN proname = 'apply_late_penalty' THEN '✅ Função de aplicar multa'
    WHEN proname = 'check_and_apply_late_penalties' THEN '✅ Função de verificação automática'
    WHEN proname = 'is_petition_late' THEN '✅ Função de verificação de atraso'
    ELSE 'Outra função'
  END as descricao
FROM pg_proc
WHERE proname IN ('apply_late_penalty', 'check_and_apply_late_penalties', 'is_petition_late');

-- ========================================
-- 2️⃣ VERIFICAR SE O CRON JOB ESTÁ CONFIGURADO
-- ========================================
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active,
  CASE 
    WHEN active THEN '✅ ATIVO'
    ELSE '❌ INATIVO'
  END as status
FROM cron.job
WHERE jobname = 'apply-late-penalties-hourly';

-- Se não existir, criar o job:
-- SELECT cron.schedule(
--   'apply-late-penalties-hourly',
--   '0 * * * *',  -- A cada hora
--   $$SELECT check_and_apply_late_penalties()$$
-- );

-- ========================================
-- 3️⃣ VERIFICAR PETIÇÕES ATRASADAS
-- ========================================
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
  EXTRACT(EPOCH FROM (NOW() - p.deadline)) / 3600 as horas_atraso,
  -- Verificar se já tem multa
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM writer_penalties wp 
      WHERE wp.petition_id = p.id 
      AND wp.penalty_type = 'late_delivery'
    ) THEN '✅ Já tem multa'
    ELSE '❌ SEM MULTA'
  END as status_multa
FROM petitions p
WHERE p.assigned_writer_id IS NOT NULL
  AND p.status IN ('in_progress', 'assigned', 'pending_review')
  AND p.deadline < NOW()
ORDER BY p.deadline ASC;

-- ========================================
-- 4️⃣ GARANTIR QUE A FUNÇÃO apply_late_penalty ESTÁ CORRETA
-- ========================================
-- Esta função DEVE desatribuir a petição e voltar para 'pending'
CREATE OR REPLACE FUNCTION apply_late_penalty(petition_id UUID, writer_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  petition_value DECIMAL(12, 2);
  penalty_amount DECIMAL(12, 2);
  petition_title TEXT;
  suspension_status TEXT;
  already_penalized BOOLEAN;
BEGIN
  -- Verificar se já aplicou multa
  SELECT EXISTS(
    SELECT 1 FROM writer_penalties
    WHERE writer_penalties.petition_id = apply_late_penalty.petition_id
    AND writer_penalties.penalty_type = 'late_delivery'
  ) INTO already_penalized;
  
  IF already_penalized THEN
    RAISE NOTICE '⚠️ Multa já foi aplicada para esta petição anteriormente. Apenas desatribuindo...';
  ELSE
    -- Buscar valor e título da petição
    SELECT price, title INTO petition_value, petition_title 
    FROM petitions 
    WHERE id = apply_late_penalty.petition_id;
    
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
      apply_late_penalty.petition_id,
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
      available_balance = GREATEST(0, available_balance - penalty_amount), -- Não permitir saldo negativo
      updated_at = NOW()
    WHERE writer_balance.writer_id = apply_late_penalty.writer_id;
    
    RAISE NOTICE '✅ Multa de R$ % aplicada ao redator %', penalty_amount, apply_late_penalty.writer_id;
  END IF;
  
  -- 🔄 DESATRIBUIR PETIÇÃO DO REDATOR E VOLTAR PARA PENDING (SEMPRE, mesmo se já teve multa)
  UPDATE petitions
  SET
    assigned_writer_id = NULL,
    status = 'pending',
    updated_at = NOW()
  WHERE id = apply_late_penalty.petition_id;
  
  RAISE NOTICE '✅ Petição % desatribuída e voltou para status "pending"', apply_late_penalty.petition_id;
  
  -- ⚠️ VERIFICAR E APLICAR SUSPENSÃO PROGRESSIVA (se a função existir)
  BEGIN
    suspension_status := apply_writer_suspension(apply_late_penalty.writer_id);
    RAISE NOTICE '✅ Suspensão verificada: %', suspension_status;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Função apply_writer_suspension não encontrada ou erro: %', SQLERRM;
  END;
  
END;
$$;

-- ========================================
-- 5️⃣ GARANTIR QUE A FUNÇÃO check_and_apply_late_penalties ESTÁ CORRETA
-- ========================================
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
    AND p.status IN ('in_progress', 'assigned', 'pending_review') -- Incluir pending_review também
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
-- 6️⃣ EXECUTAR VERIFICAÇÃO E APLICAÇÃO
-- ========================================
-- Execute esta linha para aplicar multas e desatribuir petições atrasadas:
SELECT * FROM check_and_apply_late_penalties();

-- ========================================
-- 7️⃣ VERIFICAR RESULTADO
-- ========================================
-- Ver petições que foram processadas:
SELECT 
  p.id,
  p.display_id,
  p.title,
  p.status,
  p.assigned_writer_id, -- Deve estar NULL
  p.deadline,
  wp.amount as multa_aplicada,
  wp.applied_at as data_multa,
  wp.reason
FROM petitions p
LEFT JOIN writer_penalties wp ON p.id = wp.petition_id AND wp.penalty_type = 'late_delivery'
WHERE p.deadline < NOW()
  AND (p.assigned_writer_id IS NULL OR wp.applied_at IS NOT NULL)
ORDER BY wp.applied_at DESC NULLS LAST
LIMIT 10;



