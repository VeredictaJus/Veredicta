-- ========================================
-- TESTE COMPLETO: SISTEMA DE NOTIFICAÇÕES
-- ========================================
-- Execute este arquivo para testar todos os aspectos
-- do sistema de notificações para redatores

-- ========================================
-- 🔍 PASSO 1: VERIFICAR SETUP
-- ========================================

-- 1.1 Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'app_2d8133c678_notifications'
) as "✅ Tabela existe?";

-- 1.2 Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'app_2d8133c678_notifications'
ORDER BY ordinal_position;

-- 1.3 Verificar RLS policies
SELECT 
  policyname as "Policy Name",
  permissive as "Permissive",
  roles as "Roles",
  cmd as "Command",
  qual as "Using",
  with_check as "With Check"
FROM pg_policies
WHERE tablename = 'app_2d8133c678_notifications';

-- 1.4 Verificar triggers ativos
SELECT 
  trigger_name as "Trigger",
  event_object_table as "Table",
  event_manipulation as "Event",
  action_statement as "Function"
FROM information_schema.triggers
WHERE trigger_name LIKE '%notify%'
ORDER BY event_object_table, trigger_name;

-- 1.5 Verificar funções criadas
SELECT 
  routine_name as "Function Name",
  routine_type as "Type"
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
  routine_name LIKE '%notification%' OR
  routine_name LIKE '%notify%'
)
ORDER BY routine_name;

-- ========================================
-- 🧪 PASSO 2: TESTES FUNCIONAIS
-- ========================================

-- 2.1 TESTE: Criar notificação manual
-- IMPORTANTE: Substitua 'SEU_USER_UID' pelo UID real do redator
DO $$
DECLARE
  test_user_id TEXT := 'SEU_USER_UID'; -- ⚠️ SUBSTITUIR AQUI
  notification_id UUID;
BEGIN
  -- Criar notificação de teste
  notification_id := create_notification(
    p_user_id := test_user_id,
    p_title := '🧪 Teste Manual de Notificação',
    p_body := 'Esta é uma notificação de teste criada manualmente. Se você vê isso no sino, está funcionando!',
    p_type := 'system',
    p_priority := 'high'
  );
  
  RAISE NOTICE '✅ Notificação criada com ID: %', notification_id;
END $$;

-- 2.2 Ver notificação criada
SELECT 
  id,
  user_id,
  title,
  body,
  type,
  priority,
  is_read,
  created_at
FROM app_2d8133c678_notifications
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 📊 PASSO 3: VERIFICAR DADOS
-- ========================================

-- 3.1 Total de notificações
SELECT 
  COUNT(*) as "Total de Notificações"
FROM app_2d8133c678_notifications;

-- 3.2 Notificações por tipo
SELECT 
  type as "Tipo",
  COUNT(*) as "Quantidade",
  COUNT(*) FILTER (WHERE is_read = FALSE) as "Não Lidas"
FROM app_2d8133c678_notifications
GROUP BY type
ORDER BY COUNT(*) DESC;

-- 3.3 Notificações por prioridade
SELECT 
  priority as "Prioridade",
  COUNT(*) as "Quantidade",
  COUNT(*) FILTER (WHERE is_read = FALSE) as "Não Lidas"
FROM app_2d8133c678_notifications
GROUP BY priority
ORDER BY 
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low' THEN 4
  END;

-- 3.4 Últimas notificações criadas
SELECT 
  title as "Título",
  type as "Tipo",
  priority as "Prioridade",
  is_read as "Lida?",
  created_at as "Criada em",
  AGE(NOW(), created_at) as "Há quanto tempo"
FROM app_2d8133c678_notifications
ORDER BY created_at DESC
LIMIT 10;

-- 3.5 Notificações não lidas por usuário
SELECT 
  user_id as "User ID",
  COUNT(*) as "Não Lidas",
  STRING_AGG(DISTINCT type::text, ', ') as "Tipos"
FROM app_2d8133c678_notifications
WHERE is_read = FALSE
GROUP BY user_id
ORDER BY COUNT(*) DESC;

-- ========================================
-- 🔔 PASSO 4: TESTE DE TRIGGERS
-- ========================================

-- 4.1 TESTE: Trigger de Petição Atribuída
-- NOTA: Este teste requer uma petição real e um redator real
-- Substitua os valores conforme necessário
/*
-- Exemplo de update para disparar o trigger
UPDATE petitions
SET assigned_writer_id = 'REDATOR_UID',
    updated_at = NOW()
WHERE id = 'PETITION_UUID'
AND assigned_writer_id IS NULL;

-- Verificar se notificação foi criada
SELECT * FROM app_2d8133c678_notifications
WHERE type = 'petition'
AND user_id = 'REDATOR_UID'
ORDER BY created_at DESC
LIMIT 1;
*/

-- 4.2 TESTE: Trigger de Correção Solicitada
-- NOTA: Este teste requer uma correção real
/*
-- Exemplo de insert para disparar o trigger
INSERT INTO corrections (
  petition_id,
  status,
  comments,
  created_by
) VALUES (
  'PETITION_UUID',
  'pending',
  'Teste de notificação de correção',
  'ADMIN_UID'
);

-- Verificar se notificação foi criada
SELECT * FROM app_2d8133c678_notifications
WHERE type = 'correction'
ORDER BY created_at DESC
LIMIT 1;
*/

-- ========================================
-- ⏰ PASSO 5: TESTE DE DEADLINE
-- ========================================

-- 5.1 Verificar se job de deadline está ativo (requer pg_cron)
SELECT 
  jobid as "Job ID",
  schedule as "Schedule",
  active as "Ativo?",
  database as "Database"
FROM cron.job
WHERE jobname = 'check-deadline-notifications-5min';

-- 5.2 Ver últimas execuções do job (se existir)
/*
SELECT 
  runid as "Run ID",
  status as "Status",
  return_message as "Resultado",
  start_time as "Início",
  end_time as "Fim",
  EXTRACT(EPOCH FROM (end_time - start_time)) as "Duração (s)"
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-deadline-notifications-5min')
ORDER BY start_time DESC
LIMIT 5;
*/

-- 5.3 Executar manualmente verificação de deadlines
-- SELECT * FROM check_and_notify_deadlines();

-- ========================================
-- 🧹 PASSO 6: FUNÇÕES DE MANUTENÇÃO
-- ========================================

-- 6.1 TESTE: Marcar notificação como lida
-- Substitua pelo ID de uma notificação real
/*
SELECT mark_notification_as_read('NOTIFICATION_UUID');
*/

-- 6.2 TESTE: Marcar todas como lidas para um usuário
-- Substitua pelo UID do usuário
/*
SELECT mark_all_notifications_as_read('USER_UID');
*/

-- 6.3 TESTE: Limpar notificações antigas (90+ dias)
/*
SELECT cleanup_old_notifications();
*/

-- ========================================
-- 📈 PASSO 7: ESTATÍSTICAS
-- ========================================

-- 7.1 Estatísticas gerais
SELECT 
  COUNT(*) as "Total",
  COUNT(*) FILTER (WHERE is_read = TRUE) as "Lidas",
  COUNT(*) FILTER (WHERE is_read = FALSE) as "Não Lidas",
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE is_read = TRUE) / NULLIF(COUNT(*), 0),
    2
  ) as "% Lidas",
  MIN(created_at) as "Primeira",
  MAX(created_at) as "Última",
  AGE(MAX(created_at), MIN(created_at)) as "Período"
FROM app_2d8133c678_notifications;

-- 7.2 Taxa de leitura por tipo
SELECT 
  type as "Tipo",
  COUNT(*) as "Total",
  COUNT(*) FILTER (WHERE is_read = TRUE) as "Lidas",
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE is_read = TRUE) / NULLIF(COUNT(*), 0),
    2
  ) as "% Lidas"
FROM app_2d8133c678_notifications
GROUP BY type
ORDER BY COUNT(*) DESC;

-- 7.3 Tempo médio de leitura
SELECT 
  type as "Tipo",
  COUNT(*) FILTER (WHERE read_at IS NOT NULL) as "Lidas",
  AVG(EXTRACT(EPOCH FROM (read_at - created_at)) / 60)::INTEGER as "Tempo Médio (min)",
  MIN(EXTRACT(EPOCH FROM (read_at - created_at)) / 60)::INTEGER as "Mais Rápido (min)",
  MAX(EXTRACT(EPOCH FROM (read_at - created_at)) / 60)::INTEGER as "Mais Lento (min)"
FROM app_2d8133c678_notifications
WHERE read_at IS NOT NULL
GROUP BY type
ORDER BY "Tempo Médio (min)";

-- ========================================
-- ✅ CHECKLIST FINAL
-- ========================================

-- Verificar se tudo está OK
SELECT
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_2d8133c678_notifications')
    THEN '✅' ELSE '❌'
  END as "Tabela existe?",
  
  CASE 
    WHEN COUNT(*) >= 3
    THEN '✅' ELSE '❌'
  END as "Triggers criados?",
  
  CASE 
    WHEN COUNT(*) >= 5
    THEN '✅' ELSE '❌'
  END as "Funções criadas?",
  
  CASE 
    WHEN COUNT(*) > 0
    THEN '✅' ELSE '⚠️'
  END as "Notificações existem?"
FROM (
  SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE '%notify%'
) t1,
(
  SELECT COUNT(*) FROM information_schema.routines WHERE routine_name LIKE '%notification%'
) t2,
(
  SELECT COUNT(*) FROM app_2d8133c678_notifications
) t3;

-- ========================================
-- 📝 PRÓXIMOS PASSOS
-- ========================================
/*
1. ✅ Substituir 'SEU_USER_UID' pelo UID real nos testes
2. ✅ Executar teste manual de notificação (PASSO 2.1)
3. ✅ Verificar se notificação aparece no sino do dashboard
4. ✅ Testar atribuição de petição (criar notificação automática)
5. ✅ Testar solicitação de correção (criar notificação automática)
6. ✅ Habilitar pg_cron e configurar job de deadline (opcional)
7. ✅ Monitorar logs e performance

🎉 Se todos os checkmarks estão ✅, o sistema está funcionando!
*/







