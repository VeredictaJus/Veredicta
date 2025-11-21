-- ============================================
-- HABILITAR EXTENSÃO pg_net
-- ============================================
-- A extensão pg_net permite fazer requisições HTTP do PostgreSQL
-- Necessária para o cron job chamar a Edge Function

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verificar se foi habilitada
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- ============================================
-- AGORA PODE TESTAR O HTTP POST
-- ============================================

SELECT
  net.http_post(
      url:='https://dmsodonmkffyvbuxtxec.supabase.co/functions/v1/check-plan-expiry',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNDczNjksImV4cCI6MjA1MjcyMzM2OX0.9OM0KmQvgLPQCOsQ0VBXHVjH4nF1sA8JzjQ7xEfT3Bk'
      ),
      body:='{}'::jsonb
  ) as result;










