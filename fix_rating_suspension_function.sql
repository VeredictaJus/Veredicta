-- ========================================
-- CORREÇÃO: Função apply_low_rating_suspension
-- ========================================
-- Corrige erro de formatação (%.2f não funciona no PostgreSQL)

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
    is_blocked = FALSE,
    suspended_until = NOW() + INTERVAL '365 days',
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
-- TESTE RÁPIDO
-- ========================================

-- 1. Simular dados de avaliação
UPDATE profiles_v2
SET average_rating = 2.3,
    total_ratings = 3
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- 2. Aplicar suspensão
SELECT apply_low_rating_suspension('nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2', 2.3);

-- 3. Ver resultado
SELECT 
  firebase_uid,
  full_name,
  average_rating,
  total_ratings,
  suspension_type,
  suspended_until,
  suspension_reason,
  CASE
    WHEN suspended_until IS NOT NULL AND NOW() < suspended_until THEN '⏸️ SUSPENSO'
    ELSE '✅ ATIVO'
  END as status
FROM profiles_v2
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';







