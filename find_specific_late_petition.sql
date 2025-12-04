-- ========================================
-- ENCONTRAR PETIÇÃO ESPECÍFICA ATRASADA
-- ========================================
-- Busca pela petição "ggggggg" (PET-2025-0007) que está em atraso

-- ========================================
-- 1️⃣ BUSCAR PETIÇÃO POR TÍTULO OU DISPLAY_ID
-- ========================================
SELECT 
  p.id as petition_id,
  p.display_id,
  p.title,
  p.assigned_writer_id as writer_id,
  p.status,
  p.deadline,
  p.price,
  NOW() as agora,
  p.deadline < NOW() as esta_atrasada,
  EXTRACT(EPOCH FROM (NOW() - p.deadline)) / 3600 as horas_atraso,
  -- Informações do redator
  pr.full_name as writer_name,
  pr.email as writer_email,
  pr.firebase_uid as writer_firebase_uid,
  -- Verificar se já tem multa
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM writer_penalties wp 
      WHERE wp.petition_id = p.id 
      AND wp.penalty_type = 'late_delivery'
    ) THEN '✅ Já tem multa'
    ELSE '❌ SEM MULTA'
  END as status_multa,
  -- Verificar se ainda está atribuída
  CASE 
    WHEN p.assigned_writer_id IS NOT NULL THEN '❌ AINDA ATRIBUÍDA'
    ELSE '✅ JÁ DESATRIBUÍDA'
  END as status_atribuicao
FROM petitions p
LEFT JOIN profiles_v2 pr ON p.assigned_writer_id = pr.firebase_uid
WHERE (
  p.title ILIKE '%ggggggg%' 
  OR p.display_id = 'PET-2025-0007'
  OR (p.assigned_writer_id IS NOT NULL 
      AND p.status IN ('in_progress', 'assigned', 'pending_review')
      AND p.deadline < NOW())
)
ORDER BY p.deadline ASC;

-- ========================================
-- 2️⃣ BUSCAR TODAS AS PETIÇÕES ATRASADAS (PARA COMPARAÇÃO)
-- ========================================
SELECT 
  p.id as petition_id,
  p.display_id,
  p.title,
  p.assigned_writer_id as writer_id,
  p.status,
  p.deadline,
  p.price,
  pr.full_name as writer_name,
  pr.email as writer_email
FROM petitions p
LEFT JOIN profiles_v2 pr ON p.assigned_writer_id = pr.firebase_uid
WHERE p.assigned_writer_id IS NOT NULL
  AND p.status IN ('in_progress', 'assigned', 'pending_review')
  AND p.deadline < NOW()
ORDER BY p.deadline ASC;

-- ========================================
-- 3️⃣ APLICAR CORREÇÃO AUTOMÁTICA NA PETIÇÃO ENCONTRADA
-- ========================================
DO $$
DECLARE
  v_petition_id UUID;
  v_writer_id TEXT;
  v_petition_value DECIMAL(12, 2);
  v_penalty_amount DECIMAL(12, 2);
  v_petition_title TEXT;
  v_writer_name TEXT;
  v_display_id TEXT;
BEGIN
  -- Buscar a petição "ggggggg" ou PET-2025-0007 ou a primeira atrasada
  SELECT 
    p.id,
    p.assigned_writer_id,
    COALESCE(p.price, 60.00),
    p.title,
    pr.full_name,
    p.display_id
  INTO 
    v_petition_id,
    v_writer_id,
    v_petition_value,
    v_petition_title,
    v_writer_name,
    v_display_id
  FROM petitions p
  LEFT JOIN profiles_v2 pr ON p.assigned_writer_id = pr.firebase_uid
  WHERE p.assigned_writer_id IS NOT NULL
    AND p.status IN ('in_progress', 'assigned', 'pending_review')
    AND p.deadline < NOW()
    AND (
      p.title ILIKE '%ggggggg%' 
      OR p.display_id = 'PET-2025-0007'
      OR TRUE -- Se não encontrar específica, pega a primeira atrasada
    )
  ORDER BY 
    CASE 
      WHEN p.title ILIKE '%ggggggg%' OR p.display_id = 'PET-2025-0007' THEN 1
      ELSE 2
    END,
    p.deadline ASC
  LIMIT 1;
  
  -- Verificar se encontrou petição
  IF v_petition_id IS NULL THEN
    RAISE NOTICE '❌ Nenhuma petição atrasada encontrada';
    RETURN;
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '📋 PETIÇÃO ENCONTRADA:';
  RAISE NOTICE '   Título: %', v_petition_title;
  RAISE NOTICE '   Display ID: %', v_display_id;
  RAISE NOTICE '   ID: %', v_petition_id;
  RAISE NOTICE '   Valor: R$ %', v_petition_value;
  RAISE NOTICE '';
  RAISE NOTICE '👤 REDATOR:';
  RAISE NOTICE '   Nome: %', v_writer_name;
  RAISE NOTICE '   ID: %', v_writer_id;
  RAISE NOTICE '========================================';
  
  -- Calcular multa de 50%
  v_penalty_amount := v_petition_value * 0.50;
  
  -- Garantir que existe registro de saldo
  INSERT INTO writer_balance (writer_id, total_earned, penalties_total, available_balance)
  VALUES (v_writer_id, 0, 0, 0)
  ON CONFLICT (writer_id) DO NOTHING;
  
  -- Verificar se já tem multa
  IF NOT EXISTS (
    SELECT 1 FROM writer_penalties
    WHERE petition_id = v_petition_id
    AND penalty_type = 'late_delivery'
  ) THEN
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
    
    -- Atualizar saldo
    UPDATE writer_balance
    SET 
      penalties_total = penalties_total + v_penalty_amount,
      available_balance = GREATEST(0, available_balance - v_penalty_amount),
      updated_at = NOW()
    WHERE writer_id = v_writer_id;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Multa de R$ % aplicada ao redator %', v_penalty_amount, v_writer_name;
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Multa já foi aplicada anteriormente para esta petição';
  END IF;
  
  -- Desatribuir petição
  UPDATE petitions
  SET
    assigned_writer_id = NULL,
    status = 'pending',
    updated_at = NOW()
  WHERE id = v_petition_id;
  
  RAISE NOTICE '✅ Petição desatribuída e voltou para status "pending"';
  RAISE NOTICE '✅ Agora está disponível para outros redatores';
  
  -- Aplicar suspensão se função existir
  BEGIN
    PERFORM apply_writer_suspension(v_writer_id);
    RAISE NOTICE '✅ Suspensão verificada e aplicada se necessário';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Função apply_writer_suspension não encontrada: %', SQLERRM;
  END;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CORREÇÃO CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '========================================';
  
END $$;

-- ========================================
-- 4️⃣ VERIFICAR RESULTADO APÓS CORREÇÃO
-- ========================================
SELECT 
  p.id,
  p.display_id,
  p.title,
  p.assigned_writer_id, -- Deve estar NULL
  p.status, -- Deve estar 'pending'
  p.deadline,
  wp.amount as multa_aplicada,
  wp.applied_at as data_multa,
  wp.reason
FROM petitions p
LEFT JOIN writer_penalties wp ON p.id = wp.petition_id AND wp.penalty_type = 'late_delivery'
WHERE (
  p.title ILIKE '%ggggggg%' 
  OR p.display_id = 'PET-2025-0007'
  OR (p.deadline < NOW() AND p.status = 'pending')
)
ORDER BY wp.applied_at DESC NULLS LAST;

