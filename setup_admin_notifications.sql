-- ========================================
-- SISTEMA DE NOTIFICAÇÕES PARA ADMINS
-- ========================================
-- Cria funções e triggers para notificar admins automaticamente
-- sobre eventos importantes do sistema

-- ========================================
-- 1️⃣ FUNÇÃO: Notificar Todos os Admins
-- ========================================
CREATE OR REPLACE FUNCTION notify_all_admins(
  p_title TEXT,
  p_body TEXT,
  p_type TEXT DEFAULT 'system',
  p_priority TEXT DEFAULT 'normal',
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  notifications_count INTEGER := 0;
BEGIN
  -- Buscar todos os admins ativos
  FOR admin_record IN
    SELECT firebase_uid
    FROM profiles_v2
    WHERE role = 'admin'
    -- ✅ CORREÇÃO: Removido is_active pois não existe na tabela profiles_v2
  LOOP
    -- Criar notificação para cada admin
    INSERT INTO app_2d8133c678_notifications (
      user_id,
      title,
      body,
      type,
      priority,
      related_entity_type,
      related_entity_id,
      is_read,
      created_at
    ) VALUES (
      admin_record.firebase_uid,
      p_title,
      p_body,
      p_type,
      p_priority,
      p_related_entity_type,
      p_related_entity_id,
      false,
      NOW()
    );
    
    notifications_count := notifications_count + 1;
  END LOOP;
  
  RETURN notifications_count;
END;
$$;

-- ========================================
-- 2️⃣ FUNÇÃO: Notificar Admins sobre Novo Redator
-- ========================================
CREATE OR REPLACE FUNCTION notify_admins_new_writer()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  writer_name TEXT;
  writer_email TEXT;
BEGIN
  -- Só notificar se for um novo perfil de redator (INSERT)
  IF TG_OP = 'INSERT' AND NEW.role = 'writer' THEN
    -- Buscar nome e email do redator
    -- ✅ CORREÇÃO: Removido NEW.name pois não existe na tabela profiles_v2
    writer_name := COALESCE(NEW.full_name, 'Redator');
    writer_email := COALESCE(NEW.email, '');
    
    -- Notificar todos os admins
    PERFORM notify_all_admins(
      p_title := '👤 Novo Redator Aguardando Aprovação',
      p_body := format('%s (%s) se cadastrou como redator e está aguardando aprovação.', writer_name, writer_email),
      p_type := 'approval',
      p_priority := 'high',
      p_related_entity_type := 'writer',
      p_related_entity_id := NEW.firebase_uid
    );
    
    RAISE NOTICE '✅ Notificações enviadas para admins sobre novo redator: %', NEW.firebase_uid;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- 3️⃣ FUNÇÃO: Notificar Admins sobre Petição sem Redator há muito tempo
-- ========================================
CREATE OR REPLACE FUNCTION notify_admins_unassigned_petition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  hours_since_creation INTEGER;
  petition_title TEXT;
  petition_display_id TEXT;
BEGIN
  -- Só notificar se for uma nova petição (INSERT) ou se ficou sem redator (UPDATE)
  IF (TG_OP = 'INSERT' AND NEW.assigned_writer_id IS NULL) OR
     (TG_OP = 'UPDATE' AND OLD.assigned_writer_id IS NOT NULL AND NEW.assigned_writer_id IS NULL) THEN
    
    -- Calcular horas desde a criação
    hours_since_creation := EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600;
    
    -- Só notificar se passou mais de 24 horas sem redator
    IF hours_since_creation >= 24 THEN
      petition_title := COALESCE(NEW.title, 'Petição sem título');
      petition_display_id := COALESCE(NEW.display_id, NEW.id::TEXT);
      
      -- Notificar todos os admins
      PERFORM notify_all_admins(
        p_title := '⏰ Petição sem Redator há mais de 24h',
        p_body := format('A petição "%s" (#%s) está sem redator atribuído há mais de 24 horas.', petition_title, petition_display_id),
        p_type := 'system',
        p_priority := 'high',
        p_related_entity_type := 'petition',
        p_related_entity_id := NEW.id::TEXT
      );
      
      RAISE NOTICE '✅ Notificações enviadas para admins sobre petição sem redator: %', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- 4️⃣ TRIGGERS: Ativar Notificações Automáticas
-- ========================================

-- Trigger 1: Notificar quando novo redator se cadastra
DROP TRIGGER IF EXISTS trigger_notify_admins_new_writer ON profiles_v2;
CREATE TRIGGER trigger_notify_admins_new_writer
AFTER INSERT ON profiles_v2
FOR EACH ROW
WHEN (NEW.role = 'writer')
EXECUTE FUNCTION notify_admins_new_writer();

-- Trigger 2: Notificar quando petição fica sem redator há muito tempo
-- Este trigger será executado via cron job (ver abaixo)

-- ========================================
-- 5️⃣ FUNÇÃO: Verificar Petições sem Redator há mais de 24h
-- ========================================
CREATE OR REPLACE FUNCTION check_unassigned_petitions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  petition_record RECORD;
  notifications_count INTEGER := 0;
BEGIN
  -- Buscar petições sem redator há mais de 24 horas
  FOR petition_record IN
    SELECT 
      p.id,
      p.title,
      p.display_id,
      p.created_at,
      EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 AS hours_since_creation
    FROM petitions p
    WHERE p.assigned_writer_id IS NULL
      AND p.status NOT IN ('completed', 'cancelled')
      AND EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 >= 24
      AND NOT EXISTS (
        -- Verificar se já foi notificado nas últimas 24 horas
        SELECT 1
        FROM app_2d8133c678_notifications n
        WHERE n.related_entity_type = 'petition'
          AND n.related_entity_id = p.id::TEXT
          AND n.title LIKE '%sem Redator há mais de 24h%'
          AND n.created_at > NOW() - INTERVAL '24 hours'
      )
  LOOP
    -- Notificar todos os admins
    PERFORM notify_all_admins(
      p_title := '⏰ Petição sem Redator há mais de 24h',
      p_body := format('A petição "%s" (#%s) está sem redator atribuído há mais de 24 horas.', 
        COALESCE(petition_record.title, 'Petição sem título'),
        COALESCE(petition_record.display_id, petition_record.id::TEXT)
      ),
      p_type := 'system',
      p_priority := 'high',
      p_related_entity_type := 'petition',
      p_related_entity_id := petition_record.id::TEXT
    );
    
    notifications_count := notifications_count + 1;
  END LOOP;
  
  RETURN notifications_count;
END;
$$;

-- ========================================
-- 6️⃣ CRON JOB: Verificar Petições sem Redator (a cada 6 horas)
-- ========================================
-- REQUER pg_cron habilitado
SELECT cron.schedule(
  'check-unassigned-petitions',
  '0 */6 * * *', -- A cada 6 horas
  $$SELECT check_unassigned_petitions()$$
);

-- ========================================
-- 7️⃣ FUNÇÃO: Notificar Admins sobre Necessidade de Revisão
-- ========================================
CREATE OR REPLACE FUNCTION notify_admins_review_needed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  petition_title TEXT;
  petition_display_id TEXT;
  client_name TEXT;
  writer_name TEXT;
BEGIN
  -- Só notificar se o status mudou para 'pending_review' ou 'review'
  IF TG_OP = 'UPDATE' AND 
     OLD.status NOT IN ('pending_review', 'review') AND 
     NEW.status IN ('pending_review', 'review') THEN
    
    -- Buscar informações da petição
    SELECT 
      p.title, 
      p.display_id, 
      p.client_name,
      -- ✅ CORREÇÃO: Removido w.name pois não existe na tabela profiles_v2
      COALESCE(w.full_name, 'Redator') as writer_name
    INTO petition_title, petition_display_id, client_name, writer_name
    FROM petitions p
    LEFT JOIN profiles_v2 w ON w.firebase_uid = p.assigned_writer_id
    WHERE p.id = NEW.id;
    
    petition_title := COALESCE(petition_title, 'Petição sem título');
    petition_display_id := COALESCE(petition_display_id, NEW.id::TEXT);
    client_name := COALESCE(client_name, 'Cliente');
    writer_name := COALESCE(writer_name, 'Redator');
    
    -- Verificar se já foi notificado recentemente (últimas 2 horas)
    IF NOT EXISTS (
      SELECT 1
      FROM app_2d8133c678_notifications n
      WHERE n.related_entity_type = 'petition'
        AND n.related_entity_id = NEW.id::TEXT
        AND n.title LIKE '%Necessita Revisão%'
        AND n.created_at > NOW() - INTERVAL '2 hours'
    ) THEN
      -- Notificar todos os admins
      PERFORM notify_all_admins(
        p_title := '📋 Petição Necessita Revisão',
        p_body := format('A petição "%s" (#%s) do cliente %s (redator: %s) necessita revisão.', 
          petition_title, petition_display_id, client_name, writer_name),
        p_type := 'system',
        p_priority := 'high',
        p_related_entity_type := 'petition',
        p_related_entity_id := NEW.id::TEXT
      );
      
      RAISE NOTICE '✅ Notificações enviadas para admins sobre necessidade de revisão: %', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- 8️⃣ FUNÇÃO: Verificar Notas Fiscais Pendentes e Notificar Admins
-- ========================================
CREATE OR REPLACE FUNCTION check_pending_invoices_for_payment()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  writer_record RECORD;
  previous_month INTEGER;
  previous_year INTEGER;
  current_day INTEGER;
  current_month INTEGER;
  current_year INTEGER;
  pending_writers_count INTEGER := 0;
  total_amount DECIMAL(12, 2) := 0;
  writers_list TEXT := '';
BEGIN
  -- Obter data atual
  current_day := EXTRACT(DAY FROM NOW())::INTEGER;
  current_month := EXTRACT(MONTH FROM NOW())::INTEGER;
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Calcular mês anterior
  previous_month := current_month - 1;
  previous_year := current_year;
  
  IF previous_month = 0 THEN
    previous_month := 12;
    previous_year := current_year - 1;
  END IF;
  
  -- Só executar no dia 05 de cada mês
  IF current_day = 5 THEN
    -- Buscar redatores que têm saldo disponível mas não enviaram nota fiscal do mês anterior
    FOR writer_record IN
      SELECT 
        wb.writer_id,
        wb.available_balance,
        -- ✅ CORREÇÃO: Removido p.name pois não existe na tabela profiles_v2
        COALESCE(p.full_name, 'Redator') as writer_name,
        p.email as writer_email
      FROM writer_balance wb
      JOIN profiles_v2 p ON p.firebase_uid = wb.writer_id
      WHERE wb.available_balance > 0
        AND p.role = 'writer'
        -- ✅ CORREÇÃO: Removido p.is_active pois não existe na tabela profiles_v2
        AND NOT EXISTS (
          -- Verificar se enviou nota fiscal do mês anterior
          SELECT 1
          FROM writer_invoices wi
          WHERE wi.writer_id = wb.writer_id
            AND wi.month_ref = previous_month
            AND wi.year_ref = previous_year
            AND wi.status IN ('pending', 'approved')
        )
    LOOP
      pending_writers_count := pending_writers_count + 1;
      total_amount := total_amount + writer_record.available_balance;
      
      -- Adicionar à lista de redatores
      IF writers_list != '' THEN
        writers_list := writers_list || ', ';
      END IF;
      writers_list := writers_list || format('%s (R$ %.2f)', 
        writer_record.writer_name, 
        writer_record.available_balance
      );
    END LOOP;
    
    -- Se houver redatores pendentes, notificar admins
    IF pending_writers_count > 0 THEN
      PERFORM notify_all_admins(
        p_title := '💰 Lembrete: Pagamento de Notas Fiscais',
        p_body := format(
          'Hoje é dia 05! Verifique as notas fiscais dos redatores para processar os pagamentos do mês anterior. ' ||
          'Total de %s redator(es) pendente(s) com saldo total de R$ %.2f. ' ||
          'Redatores: %s',
          pending_writers_count,
          total_amount,
          writers_list
        ),
        p_type := 'system',
        p_priority := 'high',
        p_related_entity_type := 'payment',
        p_related_entity_id := NULL
      );
      
      RAISE NOTICE '✅ Notificações enviadas para admins sobre pagamento de notas fiscais: % redatores pendentes', pending_writers_count;
    END IF;
  END IF;
  
  RETURN pending_writers_count;
END;
$$;

-- ========================================
-- 9️⃣ TRIGGERS ADICIONAIS
-- ========================================

-- Trigger 4: Notificar quando petição precisa de revisão
DROP TRIGGER IF EXISTS trigger_notify_admins_review_needed ON petitions;
CREATE TRIGGER trigger_notify_admins_review_needed
AFTER UPDATE OF status ON petitions
FOR EACH ROW
WHEN (
  OLD.status NOT IN ('pending_review', 'review') AND 
  NEW.status IN ('pending_review', 'review')
)
EXECUTE FUNCTION notify_admins_review_needed();

-- ========================================
-- 🔟 CRON JOB: Verificar Notas Fiscais Pendentes (dia 05 de cada mês)
-- ========================================
-- REQUER pg_cron habilitado
SELECT cron.schedule(
  'check-pending-invoices-payment',
  '0 9 5 * *', -- Dia 05 de cada mês às 9h
  $$SELECT check_pending_invoices_for_payment()$$
);

-- ========================================
-- 1️⃣1️⃣ GRANT PERMISSIONS
-- ========================================
GRANT EXECUTE ON FUNCTION notify_all_admins TO authenticated;
GRANT EXECUTE ON FUNCTION notify_all_admins TO anon;
GRANT EXECUTE ON FUNCTION check_unassigned_petitions TO authenticated;
GRANT EXECUTE ON FUNCTION check_unassigned_petitions TO anon;
GRANT EXECUTE ON FUNCTION notify_admins_review_needed TO authenticated;
GRANT EXECUTE ON FUNCTION notify_admins_review_needed TO anon;
GRANT EXECUTE ON FUNCTION check_pending_invoices_for_payment TO authenticated;
GRANT EXECUTE ON FUNCTION check_pending_invoices_for_payment TO anon;

-- ========================================
-- ✅ CONCLUSÃO
-- ========================================
-- Este script cria:
-- 1. Função para notificar todos os admins
-- 2. Trigger para notificar quando novo redator se cadastra
-- 3. Função e cron job para verificar petições sem redator há mais de 24h
-- 4. Trigger para notificar quando petição precisa de revisão
-- 5. Função e cron job para lembrar pagamento de notas fiscais (dia 05)
--
-- Para ativar:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Certifique-se de que pg_cron está habilitado (Database → Extensions)
-- 3. As notificações serão criadas automaticamente nos eventos acima
--
-- NOTIFICAÇÕES PARA ADMINS:
-- ✅ Novo redator aguardando aprovação
-- ✅ Revisão humana solicitada (via código frontend)
-- ✅ Petição sem redator há mais de 24h
-- ✅ Petição necessita revisão (pending_review/review)
-- ✅ Lembrete de pagamento de notas fiscais (dia 05 de cada mês)

