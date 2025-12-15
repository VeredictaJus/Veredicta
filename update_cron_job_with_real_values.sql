-- ============================================
-- ATUALIZAR JOB COM VALORES REAIS
-- ============================================

-- Primeiro, remover o job antigo com placeholders
SELECT cron.unschedule('check-plan-expiry-daily');

-- Agendar novamente com os valores CORRETOS
SELECT cron.schedule(
    'check-plan-expiry-daily',           -- Nome do job
    '0 9 * * *',                         -- Todos os dias às 9h UTC (6h BRT)
    $$
    SELECT
      net.http_post(
          url:='https://dmsodonmkffyvbuxtxec.supabase.co/functions/v1/check-plan-expiry',
          headers:=jsonb_build_object(
            'Content-Type','application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNDczNjksImV4cCI6MjA1MjcyMzM2OX0.9OM0KmQvgLPQCOsQ0VBXHVjH4nF1sA8JzjQ7xEfT3Bk'
          ),
          body:='{}'::jsonb
      ) as request_id;
    $$
);

-- Verificar se foi criado corretamente
SELECT 
    jobid,
    jobname,
    schedule,
    active,
    LEFT(command, 100) as command_preview
FROM cron.job
WHERE jobname = 'check-plan-expiry-daily';

-- ============================================
-- TESTAR MANUALMENTE AGORA (opcional)
-- ============================================

-- Se quiser testar imediatamente, execute:
SELECT
  net.http_post(
      url:='https://dmsodonmkffyvbuxtxec.supabase.co/functions/v1/check-plan-expiry',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNDczNjksImV4cCI6MjA1MjcyMzM2OX0.9OM0KmQvgLPQCOsQ0VBXHVjH4nF1sA8JzjQ7xEfT3Bk'
      ),
      body:='{}'::jsonb
  ) as result;










