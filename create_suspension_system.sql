-- ========================================
-- SISTEMA DE SUSPENSÃO POR REINCIDÊNCIA
-- ========================================
-- Regras:
-- • 3 atrasos = 30 dias de suspensão
-- • 6 atrasos = 60 dias de suspensão
-- • 9+ atrasos = Bloqueio permanente (só suporte desbloqueia)

-- ========================================
-- 1️⃣ ADICIONAR COLUNAS À TABELA profiles_v2
-- ========================================
ALTER TABLE profiles_v2 
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS total_late_deliveries INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS suspension_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS suspension_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_v2_suspended 
ON profiles_v2(firebase_uid, suspended_until) 
WHERE suspended_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_v2_blocked 
ON profiles_v2(firebase_uid) 
WHERE is_blocked = TRUE;

-- ========================================
-- 2️⃣ FUNÇÃO: Verificar se Redator está Suspenso/Bloqueado
-- ========================================
CREATE OR REPLACE FUNCTION is_writer_suspended(writer_uid TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  writer_suspended_until TIMESTAMP WITH TIME ZONE;
  writer_blocked BOOLEAN;
BEGIN
  SELECT suspended_until, is_blocked 
  INTO writer_suspended_until, writer_blocked
  FROM profiles_v2
  WHERE firebase_uid = writer_uid;
  
  -- Se bloqueado permanentemente
  IF writer_blocked THEN
    RETURN TRUE;
  END IF;
  
  -- Se suspenso e ainda dentro do período
  IF writer_suspended_until IS NOT NULL AND NOW() < writer_suspended_until THEN
    RETURN TRUE;
  END IF;
  
  -- Se a suspensão já passou, limpar o campo
  IF writer_suspended_until IS NOT NULL AND NOW() >= writer_suspended_until THEN
    UPDATE profiles_v2
    SET suspended_until = NULL, suspension_reason = NULL
    WHERE firebase_uid = writer_uid;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- ========================================
-- 3️⃣ FUNÇÃO: Aplicar Suspensão Progressiva
-- ========================================
CREATE OR REPLACE FUNCTION apply_writer_suspension(writer_uid TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  total_penalties INTEGER;
  suspension_days INTEGER;
  suspension_message TEXT;
BEGIN
  -- Contar total de atrasos do redator
  SELECT COUNT(*) INTO total_penalties
  FROM writer_penalties
  WHERE writer_id = writer_uid
    AND penalty_type = 'late_delivery';
  
  -- Atualizar contador no perfil
  UPDATE profiles_v2
  SET total_late_deliveries = total_penalties
  WHERE firebase_uid = writer_uid;
  
  -- Determinar nível de suspensão
  CASE
    -- 9+ atrasos = BLOQUEIO PERMANENTE
    WHEN total_penalties >= 9 THEN
      UPDATE profiles_v2
      SET 
        is_blocked = TRUE,
        suspended_until = NULL,
        suspension_reason = format('Bloqueio permanente por %s atrasos. Entre em contato com o suporte.', total_penalties),
        suspension_type = 'late_delivery_block',
        suspension_email_sent_at = NULL
      WHERE firebase_uid = writer_uid;
      
      suspension_message := format('🚫 BLOQUEADO PERMANENTEMENTE (%s atrasos). Contate o suporte.', total_penalties);
    
    -- 6-8 atrasos = 60 DIAS
    WHEN total_penalties >= 6 THEN
      UPDATE profiles_v2
      SET 
        is_blocked = FALSE,
        suspended_until = NOW() + INTERVAL '60 days',
        suspension_reason = format('Suspensão de 60 dias por %s atrasos.', total_penalties),
        suspension_type = 'late_delivery',
        suspension_email_sent_at = NULL
      WHERE firebase_uid = writer_uid;
      
      suspension_message := format('⏸️ SUSPENSO por 60 DIAS (%s atrasos). Volta em %s.', 
        total_penalties, 
        TO_CHAR(NOW() + INTERVAL '60 days', 'DD/MM/YYYY')
      );
    
    -- 3-5 atrasos = 30 DIAS
    WHEN total_penalties >= 3 THEN
      UPDATE profiles_v2
      SET 
        is_blocked = FALSE,
        suspended_until = NOW() + INTERVAL '30 days',
        suspension_reason = format('Suspensão de 30 dias por %s atrasos.', total_penalties),
        suspension_type = 'late_delivery',
        suspension_email_sent_at = NULL
      WHERE firebase_uid = writer_uid;
      
      suspension_message := format('⏸️ SUSPENSO por 30 DIAS (%s atrasos). Volta em %s.', 
        total_penalties, 
        TO_CHAR(NOW() + INTERVAL '30 days', 'DD/MM/YYYY')
      );
    
    -- Menos de 3 atrasos = SEM SUSPENSÃO
    ELSE
      suspension_message := format('✅ Sem suspensão (%s atrasos). Cuidado!', total_penalties);
  END CASE;
  
  RAISE NOTICE '%', suspension_message;
  
  RETURN suspension_message;
END;
$$;

-- ========================================
-- 4️⃣ ATUALIZAR FUNÇÃO: apply_late_penalty
-- ========================================
-- Incluir verificação de suspensão após aplicar multa
CREATE OR REPLACE FUNCTION apply_late_penalty(petition_id UUID, writer_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  petition_value DECIMAL(12, 2);
  penalty_amount DECIMAL(12, 2);
  petition_title TEXT;
  suspension_status TEXT;
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
  
  -- ⚠️ VERIFICAR E APLICAR SUSPENSÃO PROGRESSIVA
  suspension_status := apply_writer_suspension(apply_late_penalty.writer_id);
  
  -- Log
  RAISE NOTICE '🚨 Multa aplicada: Petição R$ % → Multa R$ % (50%%) para writer %. Petição desatribuída. %', 
    petition_value, penalty_amount, apply_late_penalty.writer_id, suspension_status;
END;
$$;

-- ========================================
-- 5️⃣ FUNÇÃO ADMIN: Desbloquear Redator
-- ========================================
CREATE OR REPLACE FUNCTION admin_unblock_writer(writer_uid TEXT, admin_note TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles_v2
  SET 
    is_blocked = FALSE,
    suspended_until = NULL,
    suspension_reason = CASE 
      WHEN admin_note IS NOT NULL 
      THEN format('Desbloqueado pelo admin. Motivo: %s', admin_note)
      ELSE 'Desbloqueado pelo admin.'
    END
  WHERE firebase_uid = writer_uid;
  
  RETURN format('✅ Redator %s desbloqueado com sucesso.', writer_uid);
END;
$$;

-- ========================================
-- 6️⃣ FUNÇÃO ADMIN: Resetar Contador de Atrasos
-- ========================================
CREATE OR REPLACE FUNCTION admin_reset_penalties_count(writer_uid TEXT, admin_note TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles_v2
  SET 
    total_late_deliveries = 0,
    is_blocked = FALSE,
    suspended_until = NULL,
    suspension_reason = format('Contador resetado pelo admin. Motivo: %s', admin_note)
  WHERE firebase_uid = writer_uid;
  
  RETURN format('✅ Contador de atrasos resetado para redator %s.', writer_uid);
END;
$$;

-- ========================================
-- 7️⃣ VIEW: Redatores Suspensos/Bloqueados
-- ========================================
CREATE OR REPLACE VIEW writer_suspension_status AS
SELECT 
  p.firebase_uid,
  p.full_name,
  p.email,
  p.total_late_deliveries as total_atrasos,
  p.is_blocked as bloqueado_permanente,
  p.suspended_until as suspenso_ate,
  p.suspension_reason as motivo,
  CASE
    WHEN p.is_blocked THEN '🚫 BLOQUEADO'
    WHEN p.suspended_until IS NOT NULL AND NOW() < p.suspended_until THEN '⏸️ SUSPENSO'
    WHEN p.suspended_until IS NOT NULL AND NOW() >= p.suspended_until THEN '✅ SUSPENSÃO EXPIRADA'
    ELSE '✅ ATIVO'
  END as status_atual,
  CASE
    WHEN p.suspended_until IS NOT NULL AND NOW() < p.suspended_until 
    THEN EXTRACT(DAY FROM (p.suspended_until - NOW()))::INTEGER
    ELSE NULL
  END as dias_restantes
FROM profiles_v2 p
WHERE p.role = 'writer'
ORDER BY p.total_late_deliveries DESC, p.suspended_until DESC;

-- ========================================
-- 8️⃣ TESTES
-- ========================================

-- Ver status de todos os redatores
SELECT * FROM writer_suspension_status;

-- Simular suspensão de um redator (teste)
-- SELECT apply_writer_suspension('WRITER_UID_AQUI');

-- Verificar se redator está suspenso
-- SELECT is_writer_suspended('WRITER_UID_AQUI');

-- Admin desbloquear redator
-- SELECT admin_unblock_writer('WRITER_UID_AQUI', 'Teste de desbloqueio');

-- Admin resetar contador
-- SELECT admin_reset_penalties_count('WRITER_UID_AQUI', 'Segunda chance');

-- ========================================
-- 9️⃣ SEGURANÇA: RLS PARA ADMIN
-- ========================================
-- Apenas admins podem executar funções de desbloqueio
-- (implementar validação no frontend)


-- ========================================
-- 🔄 Habilitar Realtime para tabelas do chat
-- ========================================
SELECT realtime.enable_table('public', 'messages');
SELECT realtime.enable_table('public', 'conversation_participants');

