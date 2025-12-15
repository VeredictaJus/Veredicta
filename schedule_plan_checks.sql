-- Script para agendar verificação diária de vencimento de planos
-- Execute este script no Supabase SQL Editor

-- NOTA: pg_cron só está disponível em planos pagos do Supabase
-- Se você estiver no plano FREE, você precisará:
-- 1. Chamar manualmente a Edge Function via API
-- 2. Ou usar um serviço externo como GitHub Actions, Vercel Cron, etc.

-- ============================================
-- OPÇÃO 1: Com pg_cron (Planos Pagos)
-- ============================================

-- Habilitar extensão pg_cron (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar verificação diária às 9h da manhã (horário UTC)
-- Ajuste o horário conforme necessário
SELECT cron.schedule(
    'check-plan-expiry-daily',           -- Nome do job
    '0 9 * * *',                         -- Cron expression: Todos os dias às 9h UTC (6h BRT)
    $$
    SELECT
      net.http_post(
          url:='https://YOUR_SUPABASE_URL.supabase.co/functions/v1/check-plan-expiry',
          headers:=jsonb_build_object(
            'Content-Type','application/json',
            'Authorization', 'Bearer YOUR_SUPABASE_ANON_KEY'
          ),
          body:='{}'::jsonb
      ) as request_id;
    $$
);

-- Verificar jobs agendados
SELECT * FROM cron.job;

-- Para remover o job (se necessário):
-- SELECT cron.unschedule('check-plan-expiry-daily');

-- ============================================
-- OPÇÃO 2: Para Plano FREE - Instruções
-- ============================================

-- Como o plano FREE não tem pg_cron, você pode:
--
-- A) Usar GitHub Actions (recomendado):
--    - Criar .github/workflows/check-plans.yml
--    - Agendar para rodar diariamente
--    - Chamar a Edge Function via curl
--
-- B) Usar Vercel Cron Jobs:
--    - Se estiver usando Vercel, adicionar vercel.json com cron
--
-- C) Usar serviços externos:
--    - cron-job.org
--    - EasyCron
--    - etc.
--
-- D) Chamar manualmente a Edge Function:
--    curl -X POST \
--      https://YOUR_SUPABASE_URL.supabase.co/functions/v1/check-plan-expiry \
--      -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
--      -H "Content-Type: application/json"

-- ============================================
-- TESTES
-- ============================================

-- Testar a Edge Function manualmente (substitua os valores):
SELECT
  net.http_post(
      url:='https://YOUR_SUPABASE_URL.supabase.co/functions/v1/check-plan-expiry',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'Authorization', 'Bearer YOUR_SUPABASE_ANON_KEY'
      ),
      body:='{}'::jsonb
  ) as request_id;










