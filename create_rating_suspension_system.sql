-- ========================================
-- SISTEMA DE SUSPENSÃO POR BAIXA AVALIAÇÃO
-- ========================================
-- Regras:
-- • Redator com média < 3.8 estrelas → Suspensão automática
-- • Apenas suporte/admin pode reabilitar
-- • Suspensão permanece até intervenção manual

-- ========================================
-- 1️⃣ ADICIONAR COLUNAS EM profiles_v2
-- ========================================
ALTER TABLE profiles_v2 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS suspension_type TEXT DEFAULT NULL; -- 'late_delivery', 'low_rating', 'manual'

-- Criar índice para consultas de avaliação
CREATE INDEX IF NOT EXISTS idx_profiles_v2_average_rating 
ON profiles_v2(firebase_uid, average_rating) 
WHERE average_rating IS NOT NULL;

-- ========================================
-- 2️⃣ FUNÇÃO: Calcular Média de Avaliação do Redator
-- ========================================
CREATE OR REPLACE FUNCTION calculate_writer_average_rating(writer_uid TEXT)
RETURNS TABLE(avg_rating DECIMAL, total_count INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  avg_val DECIMAL(3, 2);
  count_val INTEGER;
BEGIN
  -- Calcular média e contagem de avaliações do redator
  -- Buscar pela coluna writer_id (que é TEXT com firebase_uid)
  SELECT 
    ROUND(AVG(rating)::NUMERIC, 2)::DECIMAL(3, 2),
    COUNT(*)::INTEGER
  INTO avg_val, count_val
  FROM app_2d8133c678_writer_ratings
  WHERE writer_id::TEXT = writer_uid;
  
  -- Se não há avaliações, retornar NULL
  IF count_val = 0 THEN
    avg_val := NULL;
  END IF;
  
  RETURN QUERY SELECT avg_val, count_val;
END;
$$;

-- ========================================
-- 3️⃣ FUNÇÃO: Aplicar Suspensão por Baixa Avaliação
-- ========================================
CREATE OR REPLACE FUNCTION apply_low_rating_suspension(writer_uid TEXT, current_avg DECIMAL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  suspension_message TEXT;
BEGIN
  -- Aplicar suspensão indefinida até intervenção do suporte
  UPDATE profiles_v2
  SET 
    is_blocked = FALSE, -- Não é bloqueio permanente, é suspensão até suporte revisar
    suspended_until = NOW() + INTERVAL '365 days', -- 1 ano (praticamente indefinido)
    suspension_reason = 'Suspensão por baixa avaliação (média: ' || ROUND(current_avg::NUMERIC, 2)::TEXT || ' estrelas). Entre em contato com o suporte para reabilitação.',
    suspension_type = 'low_rating',
    updated_at = NOW()
  WHERE firebase_uid = writer_uid;
  
  suspension_message := '⚠️ Redator suspenso por baixa avaliação (média: ' || ROUND(current_avg::NUMERIC, 2)::TEXT || ' estrelas). Contate o suporte.';
  
  RAISE NOTICE '%', suspension_message;
  
  RETURN suspension_message;
END;
$$;

-- ========================================
-- 4️⃣ FUNÇÃO: Atualizar Média e Verificar Suspensão
-- ========================================
CREATE OR REPLACE FUNCTION update_writer_rating_and_check_suspension(writer_uid TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
  total_count INTEGER;
  current_suspension_type TEXT;
  already_suspended BOOLEAN;
BEGIN
  -- Calcular média atualizada
  SELECT * INTO avg_rating, total_count 
  FROM calculate_writer_average_rating(writer_uid);
  
  RAISE NOTICE '📊 Redator: % | Média: % | Total avaliações: %', writer_uid, COALESCE(avg_rating::TEXT, 'NULL'), total_count;
  
  -- Atualizar perfil com nova média
  UPDATE profiles_v2
  SET 
    average_rating = avg_rating,
    total_ratings = total_count,
    updated_at = NOW()
  WHERE firebase_uid = writer_uid;
  
  -- Verificar se já está suspenso por baixa avaliação
  SELECT suspension_type, 
         (suspended_until IS NOT NULL AND NOW() < suspended_until) OR is_blocked
  INTO current_suspension_type, already_suspended
  FROM profiles_v2
  WHERE firebase_uid = writer_uid;
  
  -- Se média < 3.8 E tem pelo menos 3 avaliações (para ser justo)
  IF avg_rating IS NOT NULL AND avg_rating < 3.8 AND total_count >= 3 THEN
    -- Se já está suspenso por baixa avaliação, não suspender novamente
    IF current_suspension_type = 'low_rating' AND already_suspended THEN
      RAISE NOTICE '⚠️ Redator já está suspenso por baixa avaliação. Nenhuma ação necessária.';
      RETURN;
    END IF;
    
    -- Se não está suspenso por baixa avaliação, aplicar suspensão
    IF current_suspension_type != 'low_rating' OR NOT already_suspended THEN
      PERFORM apply_low_rating_suspension(writer_uid, avg_rating);
      RAISE NOTICE '🚫 Redator suspenso por baixa avaliação!';
    END IF;
  ELSE
    RAISE NOTICE '✅ Avaliação aceitável (% estrelas com % avaliações)', COALESCE(ROUND(avg_rating::NUMERIC, 2)::TEXT, 'NULL'), total_count;
  END IF;
END;
$$;

-- ========================================
-- 5️⃣ TRIGGER: Atualizar após Nova Avaliação
-- ========================================
CREATE OR REPLACE FUNCTION trigger_check_rating_suspension()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Após inserir ou atualizar uma avaliação, verificar média do redator
  PERFORM update_writer_rating_and_check_suspension(NEW.writer_id::TEXT);
  
  RETURN NEW;
END;
$$;

-- Remover trigger se já existir
DROP TRIGGER IF EXISTS after_rating_insert_or_update ON app_2d8133c678_writer_ratings;

-- Criar trigger
CREATE TRIGGER after_rating_insert_or_update
AFTER INSERT OR UPDATE ON app_2d8133c678_writer_ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_check_rating_suspension();

-- ========================================
-- 6️⃣ FUNÇÃO ADMIN: Reabilitar Redator com Baixa Avaliação
-- ========================================
CREATE OR REPLACE FUNCTION admin_reactivate_low_rated_writer(writer_uid TEXT, admin_note TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar se está suspenso por baixa avaliação
  IF NOT EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = writer_uid 
    AND suspension_type = 'low_rating'
  ) THEN
    RETURN '❌ Este redator não está suspenso por baixa avaliação.';
  END IF;
  
  -- Reativar redator
  UPDATE profiles_v2
  SET 
    suspended_until = NULL,
    suspension_reason = format('Reativado pelo admin. Nota: %s', admin_note),
    suspension_type = NULL,
    updated_at = NOW()
  WHERE firebase_uid = writer_uid;
  
  RETURN '✅ Redator ' || writer_uid || ' reativado com sucesso. Média atual: ' || 
    COALESCE(
      (SELECT ROUND(average_rating::NUMERIC, 2)::TEXT FROM profiles_v2 WHERE firebase_uid = writer_uid),
      'N/A'
    ) || ' estrelas.';
END;
$$;

-- ========================================
-- 7️⃣ VIEW: Status de Avaliação dos Redatores
-- ========================================
CREATE OR REPLACE VIEW writer_rating_status AS
SELECT 
  p.firebase_uid,
  p.full_name,
  p.email,
  p.average_rating,
  p.total_ratings,
  p.suspension_type,
  p.suspended_until,
  p.suspension_reason,
  CASE
    WHEN p.is_blocked THEN '🚫 BLOQUEADO'
    WHEN p.suspended_until IS NOT NULL AND NOW() < p.suspended_until AND p.suspension_type = 'low_rating' 
      THEN '⚠️ SUSPENSO (BAIXA AVALIAÇÃO)'
    WHEN p.suspended_until IS NOT NULL AND NOW() < p.suspended_until AND p.suspension_type = 'late_delivery' 
      THEN '⏸️ SUSPENSO (ATRASOS)'
    WHEN p.suspended_until IS NOT NULL AND NOW() < p.suspended_until 
      THEN '⏸️ SUSPENSO'
    WHEN p.average_rating IS NOT NULL AND p.average_rating < 3.8 AND p.total_ratings >= 3
      THEN '⚠️ ATENÇÃO (BAIXA AVALIAÇÃO)'
    ELSE '✅ ATIVO'
  END as status_completo,
  CASE
    WHEN p.average_rating IS NULL THEN 'Sem avaliações'
    WHEN p.average_rating >= 4.5 THEN '⭐ Excelente'
    WHEN p.average_rating >= 4.0 THEN '👍 Bom'
    WHEN p.average_rating >= 3.8 THEN '✔️ Aceitável'
    ELSE '⚠️ Abaixo do mínimo'
  END as classificacao_avaliacao
FROM profiles_v2 p
WHERE p.role = 'writer'
ORDER BY p.average_rating DESC NULLS LAST;

-- ========================================
-- 8️⃣ ATUALIZAR MÉDIAS EXISTENTES
-- ========================================
-- Calcular e atualizar média para todos os redatores existentes
DO $$
DECLARE
  writer_record RECORD;
  avg_val DECIMAL(3, 2);
  count_val INTEGER;
BEGIN
  FOR writer_record IN 
    SELECT firebase_uid FROM profiles_v2 WHERE role = 'writer'
  LOOP
    -- Calcular média
    SELECT * INTO avg_val, count_val 
    FROM calculate_writer_average_rating(writer_record.firebase_uid);
    
    -- Atualizar perfil
    UPDATE profiles_v2
    SET 
      average_rating = avg_val,
      total_ratings = count_val
    WHERE firebase_uid = writer_record.firebase_uid;
    
    RAISE NOTICE 'Atualizado: % - Média: % (%  avaliações)', 
      writer_record.firebase_uid, avg_val, count_val;
  END LOOP;
END $$;

-- ========================================
-- 9️⃣ TESTES
-- ========================================

-- Ver status de todos os redatores
SELECT * FROM writer_rating_status;

-- Calcular média de um redator específico
-- SELECT * FROM calculate_writer_average_rating('WRITER_UID_AQUI');

-- Atualizar média e verificar suspensão manualmente
-- SELECT update_writer_rating_and_check_suspension('WRITER_UID_AQUI');

-- Admin reativar redator
-- SELECT admin_reactivate_low_rated_writer('WRITER_UID_AQUI', 'Redator comprometeu-se a melhorar qualidade');

-- Ver redatores com baixa avaliação
SELECT 
  full_name,
  email,
  average_rating,
  total_ratings,
  status_completo,
  classificacao_avaliacao
FROM writer_rating_status
WHERE average_rating < 3.8 OR average_rating IS NULL
ORDER BY average_rating ASC NULLS LAST;

