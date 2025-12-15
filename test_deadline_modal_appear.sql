-- ========================================
-- 🧪 SCRIPT DE TESTE: FORÇAR MODAL DE ALERTA DE DEADLINE
-- ========================================
-- Este script ajusta o deadline de uma petição para 1 hora no futuro
-- para que o modal de alerta apareça automaticamente

-- INSTRUÇÕES:
-- 1. Substitua 'SEU_WRITER_ID_AQUI' pelo seu ID de redator (firebase_uid)
-- 2. Execute este script no Supabase SQL Editor
-- 3. Recarregue a página do dashboard do redator
-- 4. O modal deve aparecer automaticamente

-- ========================================
-- OPÇÃO 1: Ajustar deadline de petição existente
-- ========================================
UPDATE petitions
SET deadline = NOW() + INTERVAL '60 minutes'  -- 1 hora no futuro
WHERE assigned_writer_id = 'SEU_WRITER_ID_AQUI'  -- ⚠️ SUBSTITUA AQUI
  AND status IN ('in_progress', 'assigned')
  AND deadline IS NOT NULL
LIMIT 1
RETURNING 
  id,
  title,
  deadline AT TIME ZONE 'America/Sao_Paulo' as deadline_brasil,
  status,
  assigned_writer_id;

-- ========================================
-- OPÇÃO 2: Criar petição de teste com deadline próximo
-- ========================================
-- Descomente e ajuste os valores abaixo se preferir criar uma petição de teste

/*
INSERT INTO petitions (
  id,
  title,
  description,
  client_id,
  status,
  assigned_writer_id,
  created_at,
  deadline,
  price,
  type,
  priority
)
VALUES (
  gen_random_uuid(),
  'TESTE - Modal Deadline',
  'Petição de teste para verificar modal de alerta de deadline',
  'SEU_CLIENT_ID',  -- ⚠️ Substitua por um ID de cliente válido
  'in_progress',
  'SEU_WRITER_ID_AQUI',  -- ⚠️ Substitua pelo seu ID de redator
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '60 minutes',  -- Deadline em 1 hora
  100.00,
  'Inicial',
  'normal'
)
RETURNING 
  id,
  title,
  deadline AT TIME ZONE 'America/Sao_Paulo' as deadline_brasil,
  status;
*/

-- ========================================
-- OPÇÃO 3: Verificar petições com deadline próximo
-- ========================================
-- Execute esta query para ver quais petições têm deadline em 1 hora

/*
SELECT 
  p.id,
  p.title,
  p.status,
  p.assigned_writer_id,
  p.deadline AT TIME ZONE 'America/Sao_Paulo' as deadline_brasil,
  NOW() AT TIME ZONE 'America/Sao_Paulo' as agora_brasil,
  EXTRACT(EPOCH FROM (p.deadline - NOW())) / 60 as minutos_restantes,
  CASE 
    WHEN EXTRACT(EPOCH FROM (p.deadline - NOW())) / 60 BETWEEN 55 AND 65 
    THEN '✅ DEVE APARECER MODAL'
    ELSE '❌ Não deve aparecer'
  END as status_modal
FROM petitions p
WHERE p.assigned_writer_id = 'SEU_WRITER_ID_AQUI'  -- ⚠️ SUBSTITUA AQUI
  AND p.status IN ('in_progress', 'assigned')
  AND p.deadline IS NOT NULL
  AND p.deadline > NOW()
  AND p.deadline <= NOW() + INTERVAL '2 hours'
ORDER BY p.deadline ASC;
*/

-- ========================================
-- OPÇÃO 4: Restaurar deadline original (depois do teste)
-- ========================================
-- Execute este script para restaurar o deadline original

/*
UPDATE petitions
SET deadline = deadline + INTERVAL '23 hours'  -- Adiciona 23 horas (volta ao original + 1 dia)
WHERE assigned_writer_id = 'SEU_WRITER_ID_AQUI'
  AND title LIKE '%TESTE%'
  AND status IN ('in_progress', 'assigned');
*/
























