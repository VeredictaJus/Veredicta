-- ========================================
-- TESTE COM AVALIAÇÕES REAIS
-- ========================================

-- ========================================
-- 1️⃣ LIMPAR ESTADO ANTERIOR
-- ========================================
DELETE FROM writer_penalties 
WHERE writer_id = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

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
-- 2️⃣ INSERIR AVALIAÇÕES BAIXAS (REAIS)
-- ========================================
-- Precisamos do writer_id como UUID, não TEXT
-- Vamos buscar o UUID do perfil primeiro

-- Ver UUID do writer
SELECT id, firebase_uid, full_name 
FROM profiles_v2 
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- ATENÇÃO: Use o ID retornado acima na próxima query
-- Inserir 3 avaliações baixas (média = 2.3)
-- SUBSTITUA 'WRITER_UUID_AQUI' pelo UUID retornado acima

INSERT INTO app_2d8133c678_writer_ratings (writer_id, client_id, petition_id, rating, comment)
VALUES 
  ('WRITER_UUID_AQUI'::UUID, gen_random_uuid(), gen_random_uuid(), 2, 'Teste avaliação baixa 1'),
  ('WRITER_UUID_AQUI'::UUID, gen_random_uuid(), gen_random_uuid(), 3, 'Teste avaliação baixa 2'),
  ('WRITER_UUID_AQUI'::UUID, gen_random_uuid(), gen_random_uuid(), 2, 'Teste avaliação baixa 3');

-- OU use esta query se souber que petition_id deve ser válido (NULL funciona melhor para teste)

-- ========================================
-- 3️⃣ TRIGGER AUTOMÁTICO JÁ DEVE TER EXECUTADO
-- ========================================
-- O trigger 'after_rating_insert_or_update' já executou após o INSERT
-- e já deve ter aplicado a suspensão automaticamente

-- ========================================
-- 4️⃣ VERIFICAR RESULTADO
-- ========================================

-- Ver avaliações inseridas
SELECT 
  writer_id,
  rating,
  comment,
  created_at
FROM app_2d8133c678_writer_ratings
WHERE writer_id::TEXT = (SELECT id::TEXT FROM profiles_v2 WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2')
ORDER BY created_at DESC;

-- Ver média calculada
SELECT * FROM calculate_writer_average_rating('nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2');

-- Ver status completo
SELECT * FROM writer_rating_status 
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- Ver perfil completo
SELECT 
  firebase_uid,
  full_name,
  average_rating,
  total_ratings,
  suspension_type,
  suspended_until,
  suspension_reason,
  is_blocked
FROM profiles_v2
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- average_rating: 2.33 (média de 2, 3, 2)
-- total_ratings: 3
-- suspension_type: 'low_rating'
-- suspended_until: [data ~365 dias futuro]
-- suspension_reason: 'Suspensão por baixa avaliação...'
-- is_blocked: false
-- Status na view: ⚠️ SUSPENSO (BAIXA AVALIAÇÃO)

-- ========================================
-- 5️⃣ LIMPAR DEPOIS DO TESTE
-- ========================================
-- DELETE FROM app_2d8133c678_writer_ratings WHERE comment LIKE 'Teste%';
-- SELECT update_writer_rating_and_check_suspension('nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2');







