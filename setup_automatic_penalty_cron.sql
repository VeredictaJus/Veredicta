-- ========================================
-- CONFIGURAR JOB AUTOMÁTICO DE MULTAS
-- ========================================
-- Este script configura um job que executa a cada hora
-- para verificar e aplicar multas em petições atrasadas

-- ========================================
-- 1️⃣ HABILITAR EXTENSÃO pg_cron
-- ========================================
-- IMPORTANTE: No Supabase, pg_cron pode precisar ser habilitado pelo admin
-- Se der erro, vá em: Dashboard → Database → Extensions → Habilitar pg_cron
-- 
-- ✅ FUNCIONA EM PRODUÇÃO: O job roda no servidor do Supabase, não no frontend.
--    Funciona 24/7, independente de onde o site está hospedado!

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ========================================
-- 2️⃣ AGENDAR JOB DE VERIFICAÇÃO DE MULTAS
-- ========================================
-- Executa a cada hora, no minuto 0 (00:00, 01:00, 02:00, etc)
SELECT cron.schedule(
  'apply-late-penalties-hourly',     -- Nome do job
  '0 * * * *',                        -- Cron: A cada hora
  $$SELECT check_and_apply_late_penalties()$$  -- Comando SQL
);

-- ========================================
-- 3️⃣ VERIFICAR SE O JOB FOI CRIADO
-- ========================================
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
WHERE jobname = 'apply-late-penalties-hourly';

-- ========================================
-- 4️⃣ OPÇÕES DE CONFIGURAÇÃO
-- ========================================

-- Opção A: Executar a cada 30 minutos (mais frequente)
-- SELECT cron.schedule(
--   'apply-late-penalties-30min',
--   '*/30 * * * *',  -- A cada 30 minutos
--   $$SELECT check_and_apply_late_penalties()$$
-- );

-- Opção B: Executar apenas no horário comercial (9h às 19h)
-- SELECT cron.schedule(
--   'apply-late-penalties-business-hours',
--   '0 9-19 * * *',  -- De hora em hora, das 9h às 19h
--   $$SELECT check_and_apply_late_penalties()$$
-- );

-- Opção C: Executar apenas após o deadline (18h, 19h, 20h)
-- SELECT cron.schedule(
--   'apply-late-penalties-after-deadline',
--   '0 18,19,20 * * *',  -- Às 18h, 19h e 20h
--   $$SELECT check_and_apply_late_penalties()$$
-- );

-- ========================================
-- 5️⃣ COMANDOS DE GERENCIAMENTO
-- ========================================

-- Ver todos os jobs agendados
-- SELECT * FROM cron.job ORDER BY jobid;

-- Ver histórico de execuções do job
-- SELECT 
--   jobid,
--   runid,
--   job_pid,
--   database,
--   username,
--   command,
--   status,
--   return_message,
--   start_time,
--   end_time
-- FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'apply-late-penalties-hourly')
-- ORDER BY start_time DESC
-- LIMIT 10;

-- Desabilitar o job (se necessário)
-- UPDATE cron.job SET active = false WHERE jobname = 'apply-late-penalties-hourly';

-- Habilitar o job novamente
-- UPDATE cron.job SET active = true WHERE jobname = 'apply-late-penalties-hourly';

-- Remover o job completamente
-- SELECT cron.unschedule('apply-late-penalties-hourly');

-- ========================================
-- 6️⃣ MONITORAMENTO EM PRODUÇÃO
-- ========================================
-- Para verificar se o job está funcionando em produção:
-- 
-- 1. Ver histórico de execuções (últimas 10 execuções)
SELECT 
  jobid,
  runid,
  status,
  return_message,
  start_time,
  end_time,
  EXTRACT(EPOCH FROM (end_time - start_time)) as duration_seconds
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'apply-late-penalties-hourly')
ORDER BY start_time DESC
LIMIT 10;

-- 2. Verificar se há erros recentes
SELECT 
  jobid,
  status,
  return_message,
  start_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'apply-late-penalties-hourly')
  AND status = 'failed'
ORDER BY start_time DESC
LIMIT 5;

-- 3. Ver quantas multas foram aplicadas (últimas 24h)
SELECT 
  COUNT(*) as total_penalties,
  SUM(amount) as total_penalty_amount,
  MIN(applied_at) as first_penalty,
  MAX(applied_at) as last_penalty
FROM writer_penalties
WHERE applied_at >= NOW() - INTERVAL '24 hours';

-- ========================================
-- 7️⃣ TESTE MANUAL (Antes de Confiar no Automático)
-- ========================================

-- Executar manualmente para ver se funciona
SELECT * FROM check_and_apply_late_penalties();

-- Ver saldos após aplicação
SELECT 
  writer_id,
  total_earned,
  penalties_total,
  available_balance,
  ROUND((penalties_total / NULLIF(total_earned, 0)) * 100, 2) as percentage_penalized
FROM writer_balance
WHERE penalties_total > 0
ORDER BY penalties_total DESC;

-- Ver últimas multas aplicadas
SELECT 
  wp.writer_id,
  wp.amount as multa,
  wp.reason,
  wp.applied_at,
  p.title as petition_title,
  p.deadline
FROM writer_penalties wp
LEFT JOIN petitions p ON wp.petition_id = p.id
ORDER BY wp.applied_at DESC
LIMIT 10;

