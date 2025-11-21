-- ========================================
-- NOTIFICAÇÕES AUTOMÁTICAS DE DEADLINE
-- ========================================
-- Cria um job que verifica a cada 5 minutos
-- se há petições com deadline próximo (1h)
-- e cria notificações automáticas

-- ========================================
-- 1️⃣ FUNÇÃO: Verificar e Notificar Deadlines Próximos
-- ========================================
CREATE OR REPLACE FUNCTION check_and_notify_deadlines()
RETURNS TABLE(petition_id UUID, writer_id TEXT, minutes_remaining INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  petition_record RECORD;
  notification_exists BOOLEAN;
  minutes_left INTEGER;
BEGIN
  -- Buscar petições em andamento com deadline próximo (entre 55-65 minutos)
  FOR petition_record IN
    SELECT
      p.id,
      p.title,
      p.display_id,
      p.assigned_writer_id,
      p.deadline
    FROM petitions p
    WHERE p.assigned_writer_id IS NOT NULL
      AND p.status IN ('in_progress', 'assigned')
      AND p.deadline IS NOT NULL
      -- Deadline entre 55 e 65 minutos (janela de 10min)
      AND p.deadline > NOW()
      AND p.deadline <= NOW() + INTERVAL '65 minutes'
      AND p.deadline >= NOW() + INTERVAL '55 minutes'
  LOOP
    -- Calcular minutos restantes
    minutes_left := EXTRACT(EPOCH FROM (petition_record.deadline - NOW())) / 60;
    
    -- Verificar se já existe notificação de deadline para esta petição
    SELECT EXISTS (
      SELECT 1 FROM app_2d8133c678_notifications
      WHERE user_id = petition_record.assigned_writer_id
        AND type = 'deadline'
        AND related_entity_type = 'petition'
        AND related_entity_id = petition_record.id::TEXT
        AND created_at >= NOW() - INTERVAL '2 hours' -- Evitar duplicatas nas últimas 2h
    ) INTO notification_exists;
    
    -- Se não existe notificação, criar uma
    IF NOT notification_exists THEN
      PERFORM create_notification(
        p_user_id := petition_record.assigned_writer_id,
        p_title := '⏰ Prazo Próximo!',
        p_body := format(
          'Falta aproximadamente %s minutos para o prazo da petição "%s" (#%s). Finalize e envie o quanto antes!',
          minutes_left,
          petition_record.title,
          petition_record.display_id
        ),
        p_type := 'deadline',
        p_priority := 'urgent',
        p_related_entity_type := 'petition',
        p_related_entity_id := petition_record.id::TEXT
      );
      
      -- Retornar informações da notificação criada
      RETURN QUERY SELECT 
        petition_record.id,
        petition_record.assigned_writer_id,
        minutes_left;
      
      RAISE NOTICE '⏰ Notificação de deadline criada: Petição % para redator % (% minutos restantes)',
        petition_record.id,
        petition_record.assigned_writer_id,
        minutes_left;
    END IF;
  END LOOP;
END;
$$;

-- ========================================
-- 2️⃣ AGENDAR JOB AUTOMÁTICO (pg_cron)
-- ========================================
-- NOTA: Isso requer a extensão pg_cron habilitada no Supabase
-- Vá em: Dashboard → Database → Extensions → Habilitar pg_cron

-- Verificar se pg_cron está disponível
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE '✅ pg_cron está habilitado';
  ELSE
    RAISE WARNING '⚠️ pg_cron NÃO está habilitado. Habilite em Database → Extensions';
  END IF;
END $$;

-- Remover job anterior se existir
SELECT cron.unschedule('check-deadline-notifications-5min')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-deadline-notifications-5min');

-- Agendar job para executar a cada 5 minutos
SELECT cron.schedule(
  'check-deadline-notifications-5min',  -- Nome do job
  '*/5 * * * *',                        -- A cada 5 minutos
  $$SELECT check_and_notify_deadlines()$$  -- Comando SQL
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
WHERE jobname = 'check-deadline-notifications-5min';

-- ========================================
-- 4️⃣ TESTE MANUAL
-- ========================================
-- Execute manualmente para testar se funciona
-- SELECT * FROM check_and_notify_deadlines();

-- ========================================
-- 5️⃣ VERIFICAR HISTÓRICO DE EXECUÇÕES
-- ========================================
-- Ver últimas 10 execuções do job
/*
SELECT 
  jobid,
  runid,
  job_pid,
  status,
  return_message,
  start_time,
  end_time,
  EXTRACT(EPOCH FROM (end_time - start_time)) as duration_seconds
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-deadline-notifications-5min')
ORDER BY start_time DESC
LIMIT 10;
*/

-- ========================================
-- 6️⃣ GERENCIAMENTO DO JOB
-- ========================================

-- Desabilitar o job temporariamente
-- UPDATE cron.job SET active = false WHERE jobname = 'check-deadline-notifications-5min';

-- Habilitar o job novamente
-- UPDATE cron.job SET active = true WHERE jobname = 'check-deadline-notifications-5min';

-- Remover o job completamente
-- SELECT cron.unschedule('check-deadline-notifications-5min');

-- ========================================
-- ✅ CONCLUSÃO
-- ========================================
-- O job irá verificar a cada 5 minutos se há petições
-- com deadline próximo (55-65 minutos) e criar notificações
-- automaticamente para os redatores.
--
-- IMPORTANTE: 
-- - O hook useDeadlineAlert no frontend TAMBÉM cria notificações
-- - Este job serve como backup caso o usuário não esteja logado
-- - Evita duplicatas verificando se já existe notificação recente







