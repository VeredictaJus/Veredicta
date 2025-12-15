-- ============================================
-- 🔧 CORREÇÃO: Cron Job de Invoice Reminder
-- ============================================
-- Este script corrige o cron job 4 para usar a função correta
-- ============================================

-- Verificar qual função existe
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%invoice%'
ORDER BY routine_name;

-- A função correta é: check_and_notify_invoice_upload()
-- Não: check_and_notify_invoice_reminder()

-- Corrigir o cron job 4 para usar a função correta
SELECT cron.alter_job(
  job_id := 4,
  schedule := '0 9 * * *', -- Diário às 9h
  command := $$SELECT check_and_notify_invoice_upload()$$
);

-- Verificar se foi atualizado corretamente
SELECT 
  jobid,
  jobname as "Job",
  schedule as "Schedule",
  active as "Ativo?",
  command as "Command"
FROM cron.job
WHERE jobid = 4;

-- ============================================
-- ✅ RESULTADO ESPERADO
-- ============================================
-- O cron job 4 deve estar usando:
-- Command: SELECT check_and_notify_invoice_upload()
-- ============================================







