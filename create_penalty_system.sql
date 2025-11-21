-- ========================================
-- SISTEMA DE MULTA POR ATRASO (50%)
-- ========================================
-- Aplica automaticamente multa de 50% do VALOR DA PETIÇÃO quando redator atrasa entrega
-- Exemplo: Petição R$ 100,00 atrasada → Multa R$ 50,00

-- ========================================
-- 1️⃣ TABELA: Saldo do Redator
-- ========================================
CREATE TABLE IF NOT EXISTS writer_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  writer_id TEXT NOT NULL UNIQUE,
  
  -- Saldo
  total_earned DECIMAL(12, 2) DEFAULT 0.00,     -- Total ganho (antes de multas)
  penalties_total DECIMAL(12, 2) DEFAULT 0.00,  -- Total de multas aplicadas
  available_balance DECIMAL(12, 2) DEFAULT 0.00, -- Saldo disponível (earned - penalties)
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_writer_balance_writer_id ON writer_balance(writer_id);

-- RLS
ALTER TABLE writer_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "writers_view_own_balance" ON writer_balance
  FOR SELECT
  USING (writer_id = auth.uid()::TEXT);

CREATE POLICY "admins_manage_balance" ON writer_balance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles_v2
      WHERE firebase_uid::TEXT = auth.uid()::TEXT
      AND role = 'admin'
    )
  );

-- ========================================
-- 2️⃣ TABELA: Penalidades
-- ========================================
CREATE TABLE IF NOT EXISTS writer_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  writer_id TEXT NOT NULL,
  petition_id UUID REFERENCES petitions(id),
  
  -- Detalhes da Penalidade
  penalty_type TEXT DEFAULT 'late_delivery',  -- 'late_delivery', 'quality_issue', etc
  amount DECIMAL(12, 2) NOT NULL,             -- Valor da multa
  percentage INTEGER DEFAULT 50,               -- Porcentagem aplicada
  reason TEXT,
  
  -- Metadados
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_penalties_writer_id ON writer_penalties(writer_id);
CREATE INDEX IF NOT EXISTS idx_penalties_petition_id ON writer_penalties(petition_id);
CREATE INDEX IF NOT EXISTS idx_penalties_applied_at ON writer_penalties(applied_at DESC);

-- RLS
ALTER TABLE writer_penalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "writers_view_own_penalties" ON writer_penalties
  FOR SELECT
  USING (writer_id = auth.uid()::TEXT);

CREATE POLICY "admins_manage_penalties" ON writer_penalties
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles_v2
      WHERE firebase_uid::TEXT = auth.uid()::TEXT
      AND role = 'admin'
    )
  );

-- ========================================
-- 3️⃣ FUNÇÃO: Verificar se Petição Está Atrasada
-- ========================================
CREATE OR REPLACE FUNCTION is_petition_late(petition_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  petition_deadline TIMESTAMP WITH TIME ZONE;
  petition_status TEXT;
  delivery_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Buscar dados da petição
  SELECT deadline, status, updated_at INTO petition_deadline, petition_status, delivery_time
  FROM petitions
  WHERE id = petition_id;
  
  -- Se não encontrou, não está atrasada
  IF petition_deadline IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Se já foi concluída/entregue, verificar se entregou após o deadline
  IF petition_status IN ('completed', 'delivered', 'approved') THEN
    RETURN delivery_time > petition_deadline;
  END IF;
  
  -- Se ainda está em andamento, verificar se já passou do deadline
  IF petition_status IN ('in_progress', 'assigned') THEN
    RETURN NOW() > petition_deadline;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- ========================================
-- 4️⃣ FUNÇÃO: Aplicar Multa de 50% do Valor da Petição
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
    format('Atraso na entrega da petição "%s" (R$ %s). Multa de 50%% = R$ %s.', 
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
  
  -- Log
  RAISE NOTICE '🚨 Multa aplicada: Petição R$ % → Multa R$ % (50%%) para writer %', 
    petition_value, penalty_amount, apply_late_penalty.writer_id;
END;
$$;

-- ========================================
-- 5️⃣ FUNÇÃO: Verificar e Aplicar Multas Automáticas
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
    AND p.status IN ('in_progress', 'assigned')
    AND p.deadline < NOW()
  LOOP
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
-- 6️⃣ TESTES
-- ========================================

-- Teste 1: Criar saldo fictício para teste
INSERT INTO writer_balance (writer_id, total_earned, available_balance)
VALUES ('test_writer_123', 1000.00, 1000.00)
ON CONFLICT (writer_id) 
DO UPDATE SET total_earned = 1000.00, available_balance = 1000.00;

-- Teste 2: Verificar saldo
SELECT * FROM writer_balance WHERE writer_id = 'test_writer_123';

-- Teste 3: Simular aplicação de multa (NÃO execute em produção!)
-- SELECT apply_late_penalty('PETITION_ID_AQUI', 'test_writer_123');

-- Teste 4: Ver penalidades
SELECT * FROM writer_penalties ORDER BY applied_at DESC LIMIT 5;

-- Teste 5: Limpar teste (opcional)
-- DELETE FROM writer_balance WHERE writer_id = 'test_writer_123';
-- DELETE FROM writer_penalties WHERE writer_id = 'test_writer_123';

-- ========================================
-- 7️⃣ EXECUTAR VERIFICAÇÃO MANUAL
-- ========================================
-- Execute esta query para aplicar multas em petições atrasadas
-- SELECT * FROM check_and_apply_late_penalties();

-- ========================================
-- 8️⃣ JOB AGENDADO (PostgreSQL + pg_cron)
-- ========================================
-- Para aplicar multas automaticamente a cada hora:
-- SELECT cron.schedule(
--   'apply-late-penalties',
--   '0 * * * *',  -- A cada hora
--   $$SELECT check_and_apply_late_penalties()$$
-- );

