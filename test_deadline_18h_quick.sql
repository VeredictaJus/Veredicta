-- ========================================
-- TESTE RÁPIDO: SISTEMA DE PRAZOS 18H
-- ========================================
-- Execute este script para fazer testes rápidos do sistema

-- ========================================
-- 1️⃣ VERIFICAR SE FUNÇÕES ESTÃO ATIVAS
-- ========================================
SELECT 
  'Verificação de Funções' as teste,
  COUNT(*) as funcoes_encontradas,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ Todas as funções ativas'
    ELSE '❌ Faltam funções'
  END as status
FROM pg_proc
WHERE proname IN ('calculate_deadline_18h', 'is_petition_late', 'check_and_apply_late_penalties');

-- ========================================
-- 2️⃣ TESTAR CÁLCULO DE DEADLINE (DEVE SER 18H)
-- ========================================
SELECT 
  'Teste: Cálculo Deadline' as teste,
  calculate_deadline_18h(NOW(), 0) AT TIME ZONE 'America/Sao_Paulo' as deadline_elite,
  EXTRACT(HOUR FROM calculate_deadline_18h(NOW(), 0) AT TIME ZONE 'America/Sao_Paulo') as hora,
  CASE 
    WHEN EXTRACT(HOUR FROM calculate_deadline_18h(NOW(), 0) AT TIME ZONE 'America/Sao_Paulo') = 18 THEN '✅ CORRETO (18h)'
    ELSE '❌ ERRO - Não está em 18h'
  END as resultado;

-- ========================================
-- 3️⃣ VERIFICAR PETIÇÕES RECENTES E SEUS DEADLINES
-- ========================================
SELECT 
  'Petições Recentes' as teste,
  p.id,
  p.title,
  p.created_at AT TIME ZONE 'America/Sao_Paulo' as criado_em,
  p.deadline AT TIME ZONE 'America/Sao_Paulo' as deadline,
  EXTRACT(HOUR FROM p.deadline AT TIME ZONE 'America/Sao_Paulo') as hora_deadline,
  CASE 
    WHEN EXTRACT(HOUR FROM p.deadline AT TIME ZONE 'America/Sao_Paulo') = 18 THEN '✅ CORRETO'
    ELSE '❌ ERRO - Não está em 18h'
  END as status
FROM petitions p
WHERE p.created_at >= NOW() - INTERVAL '7 days'
ORDER BY p.created_at DESC
LIMIT 10;

-- ========================================
-- 4️⃣ VERIFICAR SE HÁ PETIÇÕES ATUALMENTE ATRAZADAS (APÓS 19H)
-- ========================================
SELECT 
  'Petições Atrasadas (Após 19h)' as teste,
  p.id,
  p.title,
  p.assigned_writer_id,
  p.deadline AT TIME ZONE 'America/Sao_Paulo' as deadline,
  (p.deadline + INTERVAL '60 minutes') AT TIME ZONE 'America/Sao_Paulo' as deadline_com_tolerancia,
  NOW() AT TIME ZONE 'America/Sao_Paulo' as agora,
  CASE 
    WHEN NOW() > p.deadline + INTERVAL '60 minutes' THEN '🚨 ATRASADA (Após 19h)'
    WHEN NOW() > p.deadline THEN '⚠️ DENTRO DA TOLERÂNCIA (18h-19h)'
    ELSE '✅ NO PRAZO'
  END as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM writer_penalties WHERE petition_id = p.id) THEN '💰 Multa já aplicada'
    ELSE '⏳ Sem multa ainda'
  END as multa
FROM petitions p
WHERE p.assigned_writer_id IS NOT NULL
  AND p.status IN ('in_progress', 'assigned')
  AND p.deadline IS NOT NULL
ORDER BY p.deadline ASC
LIMIT 10;

-- ========================================
-- 5️⃣ TESTAR FUNÇÃO DE VERIFICAÇÃO DE ATRASO
-- ========================================
-- Substitua 'PETITION_ID_AQUI' por um ID real de petição
/*
SELECT 
  'Teste: is_petition_late' as teste,
  p.id,
  p.title,
  p.deadline AT TIME ZONE 'America/Sao_Paulo' as deadline,
  is_petition_late(p.id) as esta_atrasada,
  CASE 
    WHEN is_petition_late(p.id) THEN '🚨 ATRASADA'
    ELSE '✅ NO PRAZO'
  END as status
FROM petitions p
WHERE p.id = 'PETITION_ID_AQUI'::UUID;
*/

-- ========================================
-- 6️⃣ VERIFICAR ÚLTIMAS MULTAS APLICADAS
-- ========================================
SELECT 
  'Últimas Multas Aplicadas' as teste,
  wp.applied_at AT TIME ZONE 'America/Sao_Paulo' as aplicada_em,
  wp.amount as valor_multa,
  wp.percentage as percentual,
  p.title as peticao,
  p.deadline AT TIME ZONE 'America/Sao_Paulo' as deadline_peticao,
  p.updated_at AT TIME ZONE 'America/Sao_Paulo' as entregue_em,
  CASE 
    WHEN p.updated_at > p.deadline + INTERVAL '60 minutes' THEN '✅ Multa correta (após 19h)'
    ELSE '⚠️ Verificar - multa aplicada antes da tolerância?'
  END as validacao
FROM writer_penalties wp
JOIN petitions p ON wp.petition_id = p.id
WHERE wp.penalty_type = 'late_delivery'
ORDER BY wp.applied_at DESC
LIMIT 10;

-- ========================================
-- 7️⃣ RESUMO GERAL
-- ========================================
SELECT 
  'RESUMO GERAL' as secao,
  (SELECT COUNT(*) FROM petitions WHERE deadline IS NOT NULL) as total_peticoes_com_deadline,
  (SELECT COUNT(*) FROM petitions WHERE EXTRACT(HOUR FROM deadline AT TIME ZONE 'America/Sao_Paulo') = 18) as peticoes_deadline_18h,
  (SELECT COUNT(*) FROM writer_penalties WHERE penalty_type = 'late_delivery') as total_multas_aplicadas,
  (SELECT COUNT(*) FROM petitions WHERE assigned_writer_id IS NOT NULL AND status IN ('in_progress', 'assigned') AND NOW() > deadline + INTERVAL '60 minutes') as peticoes_atrasadas_agora;
























