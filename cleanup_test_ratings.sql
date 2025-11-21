-- ========================================
-- LIMPAR RATINGS DE TESTE
-- ========================================
-- Remove os 3 ratings de teste para deixar o sistema limpo

-- Passo 1: Ver os ratings atuais (antes de deletar)
SELECT 
  id,
  writer_id,
  client_id,
  petition_id,
  rating,
  comment,
  created_at
FROM app_2d8133c678_writer_ratings
ORDER BY created_at DESC;

-- Passo 2: DELETAR TODOS os ratings de teste
-- ⚠️ ATENÇÃO: Isso vai remover TODOS os ratings da tabela!
DELETE FROM app_2d8133c678_writer_ratings;

-- Passo 3: Verificar se foi deletado (deve retornar 0)
SELECT COUNT(*) as total_ratings_after_delete
FROM app_2d8133c678_writer_ratings;

-- Passo 4: Resetar as estatísticas no profiles_v2
-- (Zerar average_rating e total_ratings do writer)
UPDATE profiles_v2
SET 
  average_rating = NULL,
  total_ratings = 0,
  updated_at = NOW()
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- Passo 5: Verificar se o perfil foi resetado
SELECT 
  firebase_uid,
  full_name,
  average_rating,
  total_ratings,
  suspended_until,
  is_blocked
FROM profiles_v2
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

-- Passo 6: IMPORTANTE - Remover suspensão se houver
-- (Caso o writer tenha sido suspenso por baixa avaliação)
UPDATE profiles_v2
SET 
  suspended_until = NULL,
  is_blocked = FALSE,
  suspension_reason = NULL,
  suspension_type = NULL,
  updated_at = NOW()
WHERE firebase_uid = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';







