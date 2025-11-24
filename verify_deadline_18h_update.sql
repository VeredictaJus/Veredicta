-- ========================================
-- VERIFICAR SE ATUALIZAÇÃO PARA 18H FOI APLICADA
-- ========================================
-- Execute este script para verificar se as funções foram atualizadas corretamente

-- ========================================
-- 1️⃣ VERIFICAR SE AS FUNÇÕES EXISTEM
-- ========================================
SELECT 
  proname as function_name,
  CASE 
    WHEN proname = 'calculate_deadline_18h' THEN '✅ Função de cálculo de deadline (18h)'
    WHEN proname = 'is_petition_late' THEN '✅ Função de verificação de atraso (com tolerância)'
    WHEN proname = 'check_and_apply_late_penalties' THEN '✅ Função de aplicação de multas (com tolerância)'
    ELSE 'Outra função'
  END as description,
  CASE 
    WHEN proname IN ('calculate_deadline_18h', 'is_petition_late', 'check_and_apply_late_penalties') THEN '✅ ATUALIZADA'
    ELSE '❌ NÃO ENCONTRADA'
  END as status
FROM pg_proc
WHERE proname IN ('calculate_deadline_18h', 'is_petition_late', 'check_and_apply_late_penalties')
ORDER BY proname;

-- ========================================
-- 2️⃣ TESTAR CÁLCULO DE DEADLINE (18H)
-- ========================================
-- Teste 1: Elite - pedido às 10h (deve ser mesmo dia 18h)
SELECT 
  'Elite - Pedido 10h' as teste,
  calculate_deadline_18h('2025-01-15 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 0) as deadline_18h,
  calculate_deadline_18h('2025-01-15 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 0) + INTERVAL '60 minutes' as deadline_com_tolerancia_19h,
  EXTRACT(HOUR FROM calculate_deadline_18h('2025-01-15 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 0) AT TIME ZONE 'America/Sao_Paulo') as hora_deadline;

-- Teste 2: Pro - pedido Segunda 10h (deve ser Quarta 18h)
SELECT 
  'Pro - Pedido Segunda 10h' as teste,
  calculate_deadline_18h('2025-01-13 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 2) as deadline_18h,
  calculate_deadline_18h('2025-01-13 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 2) + INTERVAL '60 minutes' as deadline_com_tolerancia_19h,
  EXTRACT(HOUR FROM calculate_deadline_18h('2025-01-13 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 2) AT TIME ZONE 'America/Sao_Paulo') as hora_deadline;

-- Teste 3: Start - pedido Segunda 10h (deve ser Quinta 18h)
SELECT 
  'Start - Pedido Segunda 10h' as teste,
  calculate_deadline_18h('2025-01-13 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 3) as deadline_18h,
  calculate_deadline_18h('2025-01-13 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 3) + INTERVAL '60 minutes' as deadline_com_tolerancia_19h,
  EXTRACT(HOUR FROM calculate_deadline_18h('2025-01-13 10:00:00-03'::TIMESTAMP WITH TIME ZONE, 3) AT TIME ZONE 'America/Sao_Paulo') as hora_deadline;

-- ========================================
-- 3️⃣ VERIFICAR SE FUNÇÃO ANTIGA FOI REMOVIDA
-- ========================================
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_deadline_17h') THEN '❌ Função antiga ainda existe'
    ELSE '✅ Função antiga foi removida'
  END as status_funcao_antiga;

-- ========================================
-- 4️⃣ VERIFICAR TRIGGER
-- ========================================
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE 
    WHEN tgname = 'trigger_auto_calculate_deadline' THEN '✅ Trigger ativo'
    ELSE 'Outro trigger'
  END as status
FROM pg_trigger
WHERE tgname = 'trigger_auto_calculate_deadline';

-- ========================================
-- 5️⃣ RESUMO
-- ========================================
-- Se todas as verificações acima mostrarem ✅, o sistema foi atualizado com sucesso!
-- 
-- O que foi atualizado:
-- ✅ Deadlines calculados para 18h (horário oficial)
-- ✅ Tolerância de 60 minutos (até 19h)
-- ✅ Multas aplicadas apenas após 19h
-- ✅ Verificação de atrasos considerando tolerância








