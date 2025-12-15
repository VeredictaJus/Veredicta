-- ========================================
-- TESTE COMPLETO DE SUSPENSÃO POR BAIXA AVALIAÇÃO
-- ========================================

-- ========================================
-- 1️⃣ LIMPAR ESTADO ANTERIOR
-- ========================================
-- Limpar penalidades de teste
DELETE FROM writer_penalties 
WHERE writer_id = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2'
  AND (reason LIKE 'Teste%' OR reason LIKE '%teste%');

-- Resetar perfil completamente
UPDATE profiles_v2
SET suspended_until = NULL,
    is_blocked = FALSE,
    suspension_reason = NULL,
    suspension_type = NULL,
    total_late_deliveries = 0,
    average_rating = NULL,
    total_ratings = 0,
    updated_at = NOW()
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- Verificar limpeza
SELECT 
  firebase_uid,
  full_name,
  average_rating,
  total_ratings,
  suspension_type,
  suspended_until,
  is_blocked
FROM profiles_v2
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- ========================================
-- 2️⃣ SIMULAR AVALIAÇÃO BAIXA
-- ========================================
-- Atualizar manualmente para simular
UPDATE profiles_v2
SET average_rating = 2.3,
    total_ratings = 3,
    updated_at = NOW()
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- Verificar se atualizou
SELECT 
  firebase_uid,
  full_name,
  average_rating,
  total_ratings,
  suspension_type,
  CASE
    WHEN average_rating IS NULL THEN 'Sem avaliações'
    WHEN average_rating < 3.8 AND total_ratings >= 3 THEN '⚠️ DEVE SER SUSPENSO'
    ELSE '✅ OK'
  END as deve_suspender
FROM profiles_v2
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- ========================================
-- 3️⃣ APLICAR VERIFICAÇÃO DE SUSPENSÃO
-- ========================================
-- Executar função que verifica e suspende se necessário
SELECT update_writer_rating_and_check_suspension('nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2');

-- ========================================
-- 4️⃣ VERIFICAR RESULTADO
-- ========================================
-- Ver se foi suspenso
SELECT * FROM writer_rating_status 
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- Ver detalhes completos do perfil
SELECT 
  firebase_uid,
  full_name,
  email,
  average_rating,
  total_ratings,
  suspension_type,
  suspended_until,
  suspension_reason,
  is_blocked,
  CASE
    WHEN is_blocked THEN '🚫 BLOQUEADO'
    WHEN suspended_until IS NOT NULL AND NOW() < suspended_until THEN '⏸️ SUSPENSO'
    ELSE '✅ ATIVO'
  END as status_atual
FROM profiles_v2
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- ========================================
-- RESULTADO ESPERADO APÓS PASSO 4:
-- ========================================
-- average_rating: 2.3
-- total_ratings: 3
-- suspension_type: 'low_rating'
-- suspended_until: [data no futuro, ~365 dias]
-- suspension_reason: 'Suspensão por baixa avaliação...'
-- status_atual: ⏸️ SUSPENSO







