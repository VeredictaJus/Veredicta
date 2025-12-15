-- ========================================
-- REGISTRAR PAGAMENTO AUTOMATICAMENTE AO APROVAR PETIÇÃO
-- ========================================
-- Quando uma petição é aprovada, registrar o valor no saldo do redator

-- ========================================
-- 1️⃣ FUNÇÃO: Registrar Pagamento ao Aprovar
-- ========================================
CREATE OR REPLACE FUNCTION register_payment_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  petition_value DECIMAL(12, 2);
  writer_uid TEXT;
BEGIN
  -- Só processar quando status mudar para 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Obter valor da petição (padrão R$ 60,00)
    petition_value := COALESCE(NEW.price, 60.00);
    writer_uid := NEW.assigned_writer_id;
    
    -- Verificar se o writer existe
    IF writer_uid IS NULL THEN
      RAISE NOTICE '⚠️ Petição aprovada sem redator atribuído';
      RETURN NEW;
    END IF;
    
    RAISE NOTICE '✅ Petição aprovada! Registrando pagamento de R$ % para writer %', petition_value, writer_uid;
    
    -- Garantir que existe registro de saldo para o redator
    INSERT INTO writer_balance (writer_id, total_earned, penalties_total, available_balance, created_at, updated_at)
    VALUES (writer_uid, 0, 0, 0, NOW(), NOW())
    ON CONFLICT (writer_id) DO NOTHING;
    
    -- Atualizar saldo do redator
    UPDATE writer_balance
    SET 
      total_earned = total_earned + petition_value,
      available_balance = available_balance + petition_value,
      updated_at = NOW()
    WHERE writer_id = writer_uid;
    
    RAISE NOTICE '✅ Saldo atualizado! Novo total_earned para writer %', writer_uid;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- 2️⃣ TRIGGER: Ativar Função ao Aprovar Petição
-- ========================================
DROP TRIGGER IF EXISTS trigger_register_payment_on_approval ON petitions;

CREATE TRIGGER trigger_register_payment_on_approval
AFTER UPDATE OF status ON petitions
FOR EACH ROW
EXECUTE FUNCTION register_payment_on_approval();

-- ========================================
-- 3️⃣ PROCESSAR PETIÇÕES JÁ APROVADAS (Backfill)
-- ========================================
-- Atualizar saldo para petições que já foram aprovadas mas não geraram pagamento

DO $$
DECLARE
  approved_petition RECORD;
  petition_value DECIMAL(12, 2);
BEGIN
  FOR approved_petition IN
    SELECT 
      id,
      assigned_writer_id,
      price,
      title
    FROM petitions
    WHERE status = 'approved'
      AND assigned_writer_id IS NOT NULL
  LOOP
    petition_value := COALESCE(approved_petition.price, 60.00);
    
    -- Garantir que existe registro de saldo
    INSERT INTO writer_balance (writer_id, total_earned, penalties_total, available_balance, created_at, updated_at)
    VALUES (approved_petition.assigned_writer_id, 0, 0, 0, NOW(), NOW())
    ON CONFLICT (writer_id) DO NOTHING;
    
    -- Atualizar saldo
    UPDATE writer_balance
    SET 
      total_earned = total_earned + petition_value,
      available_balance = available_balance + petition_value,
      updated_at = NOW()
    WHERE writer_id = approved_petition.assigned_writer_id;
    
    RAISE NOTICE '📊 Backfill: Petição "%" (R$ %) adicionada ao saldo do writer %', 
      approved_petition.title, petition_value, approved_petition.assigned_writer_id;
  END LOOP;
END $$;

-- ========================================
-- 4️⃣ VERIFICAR SALDO ATUALIZADO
-- ========================================
SELECT 
  wb.writer_id,
  pv2.full_name,
  pv2.email,
  wb.total_earned,
  wb.penalties_total,
  wb.available_balance,
  wb.updated_at
FROM writer_balance wb
LEFT JOIN profiles_v2 pv2 ON wb.writer_id = pv2.firebase_uid
ORDER BY wb.updated_at DESC;

-- ========================================
-- 5️⃣ VERIFICAR PETIÇÕES APROVADAS
-- ========================================
SELECT 
  p.id,
  p.display_id,
  p.title,
  p.status,
  p.assigned_writer_id,
  COALESCE(p.price, 60.00) as valor_pago,
  p.updated_at
FROM petitions p
WHERE p.status = 'approved'
  AND p.assigned_writer_id IS NOT NULL
ORDER BY p.updated_at DESC;







