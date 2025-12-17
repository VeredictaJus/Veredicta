-- ========================================
-- ATUALIZAR ESTATÍSTICAS DO REDATOR AO APROVAR PETIÇÃO
-- ========================================
-- Quando uma petição é aprovada, incrementar completed_petitions do redator

-- ========================================
-- 1️⃣ FUNÇÃO: Incrementar Trabalhos Completos
-- ========================================
CREATE OR REPLACE FUNCTION increment_writer_completed_petitions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  writer_uid TEXT;
BEGIN
  -- Só processar quando status mudar para 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    writer_uid := NEW.assigned_writer_id;
    
    -- Verificar se o writer existe
    IF writer_uid IS NULL THEN
      RAISE NOTICE '⚠️ Petição aprovada sem redator atribuído';
      RETURN NEW;
    END IF;
    
    RAISE NOTICE '✅ Petição aprovada! Incrementando completed_petitions para writer %', writer_uid;
    
    -- Incrementar contador de petições completas
    UPDATE profiles_v2
    SET 
      completed_petitions = COALESCE(completed_petitions, 0) + 1,
      updated_at = NOW()
    WHERE firebase_uid = writer_uid;
    
    RAISE NOTICE '✅ completed_petitions incrementado para writer %', writer_uid;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- 2️⃣ TRIGGER: Ativar Função ao Aprovar Petição
-- ========================================
DROP TRIGGER IF EXISTS trigger_increment_completed_petitions ON petitions;

CREATE TRIGGER trigger_increment_completed_petitions
AFTER UPDATE OF status ON petitions
FOR EACH ROW
EXECUTE FUNCTION increment_writer_completed_petitions();

-- ========================================
-- 3️⃣ PROCESSAR PETIÇÕES JÁ APROVADAS (Backfill)
-- ========================================
-- Atualizar contador para petições que já foram aprovadas mas não incrementaram o contador

DO $$
DECLARE
  approved_petition RECORD;
  writer_uid TEXT;
  current_count INTEGER;
BEGIN
  FOR approved_petition IN
    SELECT 
      id,
      assigned_writer_id,
      title
    FROM petitions
    WHERE status = 'approved'
      AND assigned_writer_id IS NOT NULL
  LOOP
    writer_uid := approved_petition.assigned_writer_id;
    
    -- Contar quantas petições aprovadas o redator já tem
    SELECT COUNT(*) INTO current_count
    FROM petitions
    WHERE status = 'approved'
      AND assigned_writer_id = writer_uid;
    
    -- Atualizar contador com o valor correto
    UPDATE profiles_v2
    SET 
      completed_petitions = current_count,
      updated_at = NOW()
    WHERE firebase_uid = writer_uid;
    
    RAISE NOTICE '📊 Backfill: Writer % agora tem % petições completas', writer_uid, current_count;
  END LOOP;
END $$;

-- ========================================
-- 4️⃣ VERIFICAR ESTATÍSTICAS ATUALIZADAS
-- ========================================
SELECT 
  pv2.firebase_uid,
  pv2.full_name,
  pv2.email,
  pv2.average_rating,
  pv2.total_ratings,
  pv2.completed_petitions,
  pv2.updated_at,
  -- Verificar se os números batem
  (SELECT COUNT(*) FROM petitions WHERE status = 'approved' AND assigned_writer_id = pv2.firebase_uid) as peticoes_aprovadas_real,
  (SELECT COUNT(*) FROM app_2d8133c678_writer_ratings WHERE writer_id::TEXT = pv2.firebase_uid) as avaliacoes_real
FROM profiles_v2 pv2
WHERE pv2.role = 'writer'
ORDER BY pv2.completed_petitions DESC NULLS LAST
LIMIT 10;






