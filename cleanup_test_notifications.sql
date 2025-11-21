-- ============================================
-- 🧹 LIMPEZA DE NOTIFICAÇÕES DE TESTE
-- ============================================
-- Este script remove TODAS as notificações de teste
-- mantendo apenas a estrutura funcional (triggers, functions, cron jobs)
-- ============================================

-- 1️⃣ DELETAR TODAS AS NOTIFICAÇÕES DE TESTE
DELETE FROM app_2d8133c678_notifications
WHERE created_at < NOW() - INTERVAL '1 hour' -- Notificações criadas há mais de 1 hora
  OR title LIKE '%Teste%'
  OR body LIKE '%Teste%'
  OR body LIKE '%Este é um teste%';

-- 2️⃣ VERIFICAR QUANTAS NOTIFICAÇÕES RESTARAM
SELECT 
  COUNT(*) as "Total de Notificações",
  COUNT(*) FILTER (WHERE is_read = FALSE) as "Não Lidas",
  COUNT(*) FILTER (WHERE is_read = TRUE) as "Lidas"
FROM app_2d8133c678_notifications;

-- 3️⃣ VERIFICAR NOTIFICAÇÕES POR TIPO
SELECT 
  type as "Tipo",
  COUNT(*) as "Quantidade",
  COUNT(*) FILTER (WHERE is_read = FALSE) as "Não Lidas"
FROM app_2d8133c678_notifications
GROUP BY type
ORDER BY COUNT(*) DESC;

-- 4️⃣ VERIFICAR SE OS TRIGGERS ESTÃO ATIVOS
SELECT 
  trigger_name as "Trigger",
  event_object_table as "Tabela",
  event_manipulation as "Evento"
FROM information_schema.triggers
WHERE trigger_name LIKE '%notify%'
ORDER BY event_object_table, trigger_name;

-- 5️⃣ VERIFICAR SE OS CRON JOBS ESTÃO ATIVOS
SELECT 
  jobid,
  jobname as "Job",
  schedule as "Schedule",
  active as "Ativo?"
FROM cron.job
WHERE jobname LIKE '%invoice%' OR jobname LIKE '%notification%' OR jobname LIKE '%deadline%';

-- ============================================
-- ✅ RESULTADO ESPERADO
-- ============================================
-- 1. Notificações de teste removidas
-- 2. Sistema de notificações ATIVO e funcional
-- 3. Triggers monitorando eventos em tempo real
-- 4. Cron jobs agendados e funcionando
-- ============================================







