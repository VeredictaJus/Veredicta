-- ========================================
-- NOTIFICAÇÕES ADICIONAIS PARA REDATORES
-- ========================================
-- 1. Mensagem no Chat
-- 2. Lembrete de Nota Fiscal (dias 1-5 do mês)
-- 3. Petições Disponíveis

-- ========================================
-- 1️⃣ NOTIFICAÇÃO: Nova Mensagem no Chat
-- ========================================

CREATE OR REPLACE FUNCTION notify_writer_new_chat_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  recipient_id TEXT;
  sender_name TEXT;
  conversation_title TEXT;
BEGIN
  -- Ignorar mensagens de sistema ou do próprio remetente
  IF NEW.sender_id = 'system' OR NEW.message_type = 'system' THEN
    RETURN NEW;
  END IF;
  
  -- Buscar informações da conversa
  SELECT title INTO conversation_title
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  -- Buscar nome do remetente
  SELECT full_name INTO sender_name
  FROM profiles_v2
  WHERE LOWER(firebase_uid) = LOWER(NEW.sender_id);
  
  -- Buscar participantes da conversa (exceto o remetente)
  FOR recipient_id IN
    SELECT user_id
    FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id
    AND LOWER(user_id) != LOWER(NEW.sender_id)
  LOOP
    -- Verificar se o destinatário é um redator
    IF EXISTS (
      SELECT 1 FROM profiles_v2 
      WHERE LOWER(firebase_uid) = LOWER(recipient_id) 
      AND role = 'writer'
    ) THEN
      -- Criar notificação
      PERFORM create_notification(
        p_user_id := recipient_id,
        p_title := format('💬 Nova mensagem de %s', COALESCE(sender_name, 'Usuário')),
        p_body := format('Você tem uma nova mensagem na conversa "%s"', conversation_title),
        p_type := 'chat',
        p_priority := 'normal',
        p_related_entity_type := 'conversation',
        p_related_entity_id := NEW.conversation_id::TEXT
      );
      
      RAISE NOTICE '💬 Notificação de chat enviada para redator %', recipient_id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para mensagens
DROP TRIGGER IF EXISTS trigger_notify_writer_chat_message ON messages;
CREATE TRIGGER trigger_notify_writer_chat_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_writer_new_chat_message();

-- ========================================
-- 2️⃣ NOTIFICAÇÃO: Lembrete de Nota Fiscal
-- ========================================

CREATE OR REPLACE FUNCTION check_and_notify_invoice_upload()
RETURNS TABLE(writer_id TEXT, notification_id UUID)
LANGUAGE plpgsql
AS $$
DECLARE
  writer_record RECORD;
  current_day INTEGER;
  current_month INTEGER;
  current_year INTEGER;
  has_invoice BOOLEAN;
  notification_exists BOOLEAN;
  new_notification_id UUID;
BEGIN
  -- Obter dia, mês e ano atual
  current_day := EXTRACT(DAY FROM CURRENT_DATE);
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Apenas notificar entre os dias 1 e 5 do mês
  IF current_day > 5 THEN
    RETURN;
  END IF;
  
  -- Buscar todos os redatores ativos
  FOR writer_record IN
    SELECT 
      p.firebase_uid,
      p.full_name,
      p.email
    FROM profiles_v2 p
    WHERE p.role = 'writer'
    AND p.is_blocked = FALSE
    AND (p.suspended_until IS NULL OR p.suspended_until < NOW())
  LOOP
    -- Verificar se já enviou nota fiscal este mês
    SELECT EXISTS (
      SELECT 1 FROM writer_invoices
      WHERE writer_id = writer_record.firebase_uid
      AND EXTRACT(MONTH FROM upload_date) = current_month
      AND EXTRACT(YEAR FROM upload_date) = current_year
    ) INTO has_invoice;
    
    -- Se não enviou, verificar se já foi notificado este mês
    IF NOT has_invoice THEN
      SELECT EXISTS (
        SELECT 1 FROM app_2d8133c678_notifications
        WHERE LOWER(user_id) = LOWER(writer_record.firebase_uid)
        AND type = 'invoice_reminder'
        AND EXTRACT(MONTH FROM created_at) = current_month
        AND EXTRACT(YEAR FROM created_at) = current_year
      ) INTO notification_exists;
      
      -- Se não foi notificado ainda este mês, criar notificação
      IF NOT notification_exists THEN
        new_notification_id := create_notification(
          p_user_id := writer_record.firebase_uid,
          p_title := '📄 Lembrete: Anexar Nota Fiscal',
          p_body := format(
            'Olá %s! Não esqueça de anexar sua nota fiscal até o dia 5 deste mês para receber seu pagamento no dia 5 do mês seguinte.',
            COALESCE(writer_record.full_name, 'Redator')
          ),
          p_type := 'invoice_reminder',
          p_priority := 'high',
          p_related_entity_type := 'invoice',
          p_related_entity_id := NULL
        );
        
        RETURN QUERY SELECT writer_record.firebase_uid, new_notification_id;
        
        RAISE NOTICE '📄 Notificação de nota fiscal enviada para % (dia % do mês)', 
          writer_record.full_name, current_day;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Criar tabela de invoices se não existir
CREATE TABLE IF NOT EXISTS writer_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  writer_id TEXT NOT NULL REFERENCES profiles_v2(firebase_uid),
  invoice_url TEXT NOT NULL,
  invoice_number TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month_ref INTEGER NOT NULL, -- Mês de referência (1-12)
  year_ref INTEGER NOT NULL,  -- Ano de referência
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para writer_invoices
ALTER TABLE writer_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Writers can view own invoices" ON writer_invoices
FOR SELECT USING (LOWER(writer_id) = LOWER(auth.uid()::TEXT));

CREATE POLICY "Writers can insert own invoices" ON writer_invoices
FOR INSERT WITH CHECK (LOWER(writer_id) = LOWER(auth.uid()::TEXT));

CREATE POLICY "Admins can manage all invoices" ON writer_invoices
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE LOWER(firebase_uid) = LOWER(auth.uid()::TEXT) 
    AND role = 'admin'
  )
);

-- Agendar job para verificar notas fiscais (dias 1-5 do mês, às 9h)
-- REQUER pg_cron habilitado
SELECT cron.schedule(
  'check-invoice-reminders-daily',
  '0 9 * * *', -- Todos os dias às 9h
  $$SELECT check_and_notify_invoice_upload()$$
);

-- ========================================
-- 3️⃣ NOTIFICAÇÃO: Petições Disponíveis
-- ========================================

CREATE OR REPLACE FUNCTION notify_writers_new_petition_available()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  writer_record RECORD;
  petition_display_id TEXT;
  notification_exists BOOLEAN;
BEGIN
  -- Notificar apenas quando petição se torna 'pending' (disponível)
  IF NEW.status = 'pending' AND (OLD.status IS NULL OR OLD.status != 'pending') THEN
    
    -- Buscar display_id da petição
    SELECT display_id INTO petition_display_id
    FROM petitions
    WHERE id = NEW.id;
    
    -- Buscar todos os redatores ativos e não suspensos
    FOR writer_record IN
      SELECT 
        p.firebase_uid,
        p.full_name,
        p.email
      FROM profiles_v2 p
      WHERE p.role = 'writer'
      AND p.is_blocked = FALSE
      AND (p.suspended_until IS NULL OR p.suspended_until < NOW())
      -- Redatores com avaliação >= 3.8 OU sem avaliações ainda
      AND (p.average_rating IS NULL OR p.total_ratings < 3 OR p.average_rating >= 3.8)
    LOOP
      -- Verificar se já foi notificado sobre esta petição nas últimas 24h
      SELECT EXISTS (
        SELECT 1 FROM app_2d8133c678_notifications
        WHERE LOWER(user_id) = LOWER(writer_record.firebase_uid)
        AND type = 'petition_available'
        AND related_entity_id = NEW.id::TEXT
        AND created_at >= NOW() - INTERVAL '24 hours'
      ) INTO notification_exists;
      
      -- Se não foi notificado recentemente, criar notificação
      IF NOT notification_exists THEN
        PERFORM create_notification(
          p_user_id := writer_record.firebase_uid,
          p_title := '📢 Nova Petição Disponível',
          p_body := format(
            'Uma nova petição "%s" (#%s) está disponível para aceitar. Acesse "Petições Disponíveis" para visualizar.',
            NEW.title,
            petition_display_id
          ),
          p_type := 'petition_available',
          p_priority := 'normal',
          p_related_entity_type := 'petition',
          p_related_entity_id := NEW.id::TEXT
        );
        
        RAISE NOTICE '📢 Notificação de petição disponível enviada para %', writer_record.full_name;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para petições disponíveis
DROP TRIGGER IF EXISTS trigger_notify_petition_available ON petitions;
CREATE TRIGGER trigger_notify_petition_available
AFTER INSERT OR UPDATE OF status ON petitions
FOR EACH ROW
EXECUTE FUNCTION notify_writers_new_petition_available();

-- ========================================
-- 4️⃣ ATUALIZAR TIPO DE NOTIFICAÇÃO
-- ========================================

-- Adicionar novos tipos ao CHECK constraint
ALTER TABLE app_2d8133c678_notifications 
DROP CONSTRAINT IF EXISTS app_2d8133c678_notifications_type_check;

ALTER TABLE app_2d8133c678_notifications
ADD CONSTRAINT app_2d8133c678_notifications_type_check 
CHECK (type IN (
  'system', 
  'petition', 
  'payment', 
  'correction', 
  'deadline', 
  'chat', 
  'approval',
  'invoice_reminder',      -- ✅ NOVO: Lembrete de nota fiscal
  'petition_available'     -- ✅ NOVO: Petição disponível
));

-- ========================================
-- 5️⃣ TESTES
-- ========================================

-- Teste 1: Criar notificação de chat manual
SELECT create_notification(
  p_user_id := 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2',
  p_title := '💬 Nova mensagem de teste',
  p_body := 'Você tem uma nova mensagem no chat',
  p_type := 'chat',
  p_priority := 'normal'
);

-- Teste 2: Criar notificação de nota fiscal manual
SELECT create_notification(
  p_user_id := 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2',
  p_title := '📄 Lembrete: Anexar Nota Fiscal',
  p_body := 'Não esqueça de anexar sua nota fiscal até o dia 5 para receber seu pagamento.',
  p_type := 'invoice_reminder',
  p_priority := 'high'
);

-- Teste 3: Criar notificação de petição disponível manual
SELECT create_notification(
  p_user_id := 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2',
  p_title := '📢 Nova Petição Disponível',
  p_body := 'Uma nova petição está disponível para você aceitar!',
  p_type := 'petition_available',
  p_priority := 'normal'
);

-- Teste 4: Verificar se as 3 novas notificações foram criadas
SELECT 
  id,
  title,
  type,
  priority,
  is_read,
  created_at
FROM app_2d8133c678_notifications
WHERE user_id = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2'
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 6️⃣ VERIFICAR TRIGGERS CRIADOS
-- ========================================

SELECT 
  trigger_name as "Trigger",
  event_object_table as "Tabela",
  event_manipulation as "Evento"
FROM information_schema.triggers
WHERE trigger_name LIKE '%notify%'
ORDER BY event_object_table, trigger_name;

-- ========================================
-- 7️⃣ VERIFICAR JOBS AGENDADOS
-- ========================================

SELECT 
  jobid,
  jobname as "Job",
  schedule as "Schedule",
  active as "Ativo?"
FROM cron.job
WHERE jobname LIKE '%invoice%' OR jobname LIKE '%notification%'
ORDER BY jobname;

-- ========================================
-- 📝 RESUMO DAS NOTIFICAÇÕES
-- ========================================
/*
✅ NOTIFICAÇÕES AUTOMÁTICAS IMPLEMENTADAS:

1. 📋 Nova Petição Atribuída (trigger em petitions)
2. 🔄 Correção Solicitada (trigger em corrections)
3. 💰 Pagamento Registrado (trigger em writer_monthly_payments)
4. ⏰ Prazo Próximo - 1h antes (hook + cron)
5. 💬 Nova Mensagem no Chat (trigger em messages) ✅ NOVO
6. 📄 Lembrete Nota Fiscal (cron - dias 1-5) ✅ NOVO
7. 📢 Petições Disponíveis (trigger em petitions) ✅ NOVO

TIPOS DE NOTIFICAÇÃO:
- system
- petition (atribuída)
- payment
- correction
- deadline
- chat ✅ NOVO
- approval
- invoice_reminder ✅ NOVO
- petition_available ✅ NOVO
*/







