-- ========================================
-- TESTE DIRETO DE SUSPENSÃO POR BAIXA AVALIAÇÃO
-- ========================================
-- Abordagem: Simular os valores E aplicar suspensão diretamente
--
-- ⚠️ PRIMEIRO: Execute o arquivo create_rating_suspension_system.sql
--             para criar/atualizar a função corrigida!

-- ========================================
-- 1️⃣ LIMPAR ESTADO
-- ========================================
UPDATE profiles_v2
SET suspended_until = NULL,
    is_blocked = FALSE,
    suspension_reason = NULL,
    suspension_type = NULL,
    total_late_deliveries = 0,
    average_rating = NULL,
    total_ratings = 0
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- ========================================
-- 2️⃣ SIMULAR DADOS DE AVALIAÇÃO
-- ========================================
UPDATE profiles_v2
SET average_rating = 2.3,
    total_ratings = 3
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- ========================================
-- 3️⃣ APLICAR SUSPENSÃO DIRETAMENTE
-- ========================================
SELECT apply_low_rating_suspension('nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2', 2.3);

-- ========================================
-- 4️⃣ VERIFICAR RESULTADO
-- ========================================

-- Ver status na view
SELECT * FROM writer_rating_status 
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- Ver perfil detalhado
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
  END as status_visual
FROM profiles_v2
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- average_rating: 2.30
-- total_ratings: 3
-- suspension_type: 'low_rating'
-- suspended_until: [~365 dias no futuro]
-- suspension_reason: 'Suspensão por baixa avaliação (média: 2.30 estrelas)...'
-- is_blocked: false
-- status_visual: ⏸️ SUSPENSO

-- ========================================
-- 5️⃣ TESTAR REATIVAÇÃO (ADMIN)
-- ========================================
-- SELECT admin_reactivate_low_rated_writer('nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2', 'Redator comprometeu-se a melhorar após conversa');
-- SELECT * FROM writer_rating_status WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- ========================================
-- 6️⃣ LIMPAR TESTE
-- ========================================
-- UPDATE profiles_v2
-- SET suspended_until = NULL,
--     suspension_reason = NULL,
--     suspension_type = NULL,
--     average_rating = NULL,
--     total_ratings = 0
-- WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

