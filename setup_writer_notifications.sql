-- ========================================
-- SISTEMA DE NOTIFICAÇÕES PARA REDATORES
-- ========================================
-- Cria tabela de notificações e configura RLS
-- para permitir que redatores vejam suas próprias notificações

-- ========================================
-- 1️⃣ CRIAR TABELA DE NOTIFICAÇÕES
-- ========================================
CREATE TABLE IF NOT EXISTS app_2d8133c678_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'system' CHECK (type IN ('system', 'petition', 'payment', 'correction', 'deadline', 'chat', 'approval')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type TEXT, -- 'petition', 'payment', 'correction', 'chat'
  related_entity_id TEXT, -- UUID da entidade relacionada
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 🔧 ATUALIZAR TABELA EXISTENTE (Adicionar colunas que podem faltar)
-- ========================================
-- Versão simplificada: adiciona colunas diretamente se não existirem

-- Adicionar coluna 'body' se não existir
ALTER TABLE app_2d8133c678_notifications 
ADD COLUMN IF NOT EXISTS body TEXT;

-- Adicionar coluna 'read_at' se não existir
ALTER TABLE app_2d8133c678_notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna 'related_entity_type' se não existir
ALTER TABLE app_2d8133c678_notifications 
ADD COLUMN IF NOT EXISTS related_entity_type TEXT;

-- Adicionar coluna 'related_entity_id' se não existir
ALTER TABLE app_2d8133c678_notifications 
ADD COLUMN IF NOT EXISTS related_entity_id TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON app_2d8133c678_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON app_2d8133c678_notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON app_2d8133c678_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON app_2d8133c678_notifications(user_id, is_read) WHERE is_read = FALSE;

-- ========================================
-- 2️⃣ CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ========================================
ALTER TABLE app_2d8133c678_notifications ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own notifications" ON app_2d8133c678_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON app_2d8133c678_notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON app_2d8133c678_notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON app_2d8133c678_notifications;

-- Policy 1: Usuários podem ver apenas suas próprias notificações
CREATE POLICY "Users can view own notifications" 
ON app_2d8133c678_notifications
FOR SELECT 
USING (
  user_id = auth.uid()::TEXT
  OR user_id ILIKE auth.uid()::TEXT -- Case-insensitive
);

-- Policy 2: Usuários podem atualizar (marcar como lida) suas próprias notificações
CREATE POLICY "Users can update own notifications" 
ON app_2d8133c678_notifications
FOR UPDATE 
USING (
  user_id = auth.uid()::TEXT
  OR user_id ILIKE auth.uid()::TEXT -- Case-insensitive
)
WITH CHECK (
  user_id = auth.uid()::TEXT
  OR user_id ILIKE auth.uid()::TEXT -- Case-insensitive
);

-- Policy 3: Permitir INSERT para todos (backend vai validar)
-- Isso permite que o sistema crie notificações automaticamente
CREATE POLICY "Allow insert notifications" 
ON app_2d8133c678_notifications
FOR INSERT 
WITH CHECK (true);

-- Policy 4: Admins podem ver e gerenciar todas as notificações
CREATE POLICY "Admins can manage all notifications" 
ON app_2d8133c678_notifications
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = auth.uid()::TEXT 
    AND role = 'admin'
  )
);

-- ========================================
-- 3️⃣ FUNÇÃO: Criar Notificação Automática
-- ========================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'system',
  p_priority TEXT DEFAULT 'normal',
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO app_2d8133c678_notifications (
    user_id,
    title,
    body,
    type,
    priority,
    related_entity_type,
    related_entity_id
  ) VALUES (
    p_user_id,
    p_title,
    p_body,
    p_type,
    p_priority,
    p_related_entity_type,
    p_related_entity_id
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- ========================================
-- 4️⃣ FUNÇÃO: Notificar Redator sobre Nova Petição
-- ========================================
CREATE OR REPLACE FUNCTION notify_writer_new_petition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  petition_title TEXT;
  petition_display_id TEXT;
BEGIN
  -- Só notificar se a petição foi atribuída a um redator
  IF NEW.assigned_writer_id IS NOT NULL AND 
     (OLD.assigned_writer_id IS NULL OR OLD.assigned_writer_id != NEW.assigned_writer_id) THEN
    
    -- Buscar título e display_id da petição
    SELECT title, display_id INTO petition_title, petition_display_id
    FROM petitions
    WHERE id = NEW.id;
    
    -- Criar notificação
    PERFORM create_notification(
      p_user_id := NEW.assigned_writer_id,
      p_title := '📋 Nova Petição Atribuída',
      p_body := format('Petição "%s" (#%s) foi atribuída a você.', petition_title, petition_display_id),
      p_type := 'petition',
      p_priority := 'high',
      p_related_entity_type := 'petition',
      p_related_entity_id := NEW.id::TEXT
    );
    
    RAISE NOTICE '✅ Notificação enviada para redator % sobre petição %', NEW.assigned_writer_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- 5️⃣ FUNÇÃO: Notificar Redator sobre Correção
-- ========================================
CREATE OR REPLACE FUNCTION notify_writer_correction_requested()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  petition_title TEXT;
  petition_display_id TEXT;
  writer_id TEXT;
BEGIN
  -- Só notificar se for uma nova correção (INSERT) ou se o status mudou para 'pending'
  IF (TG_OP = 'INSERT' AND NEW.status = 'pending') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'pending' AND NEW.status = 'pending') THEN
    
    -- Buscar redator e informações da petição
    SELECT p.assigned_writer_id, p.title, p.display_id 
    INTO writer_id, petition_title, petition_display_id
    FROM petitions p
    WHERE p.id = NEW.petition_id;
    
    IF writer_id IS NOT NULL THEN
      -- Criar notificação
      PERFORM create_notification(
        p_user_id := writer_id,
        p_title := '🔄 Correção Solicitada',
        p_body := format('O admin solicitou correções na petição "%s" (#%s). Verifique os comentários.', petition_title, petition_display_id),
        p_type := 'correction',
        p_priority := 'urgent',
        p_related_entity_type := 'correction',
        p_related_entity_id := NEW.id::TEXT
      );
      
      RAISE NOTICE '✅ Notificação de correção enviada para redator % sobre petição %', writer_id, NEW.petition_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- 6️⃣ TRIGGERS: Ativar Notificações Automáticas
-- ========================================

-- Trigger 1: Notificar quando petição é atribuída
DROP TRIGGER IF EXISTS trigger_notify_writer_new_petition ON petitions;
CREATE TRIGGER trigger_notify_writer_new_petition
AFTER INSERT OR UPDATE OF assigned_writer_id ON petitions
FOR EACH ROW
EXECUTE FUNCTION notify_writer_new_petition();

-- Trigger 2: Notificar quando correção é solicitada
DROP TRIGGER IF EXISTS trigger_notify_writer_correction ON corrections;
CREATE TRIGGER trigger_notify_writer_correction
AFTER INSERT OR UPDATE OF status ON corrections
FOR EACH ROW
EXECUTE FUNCTION notify_writer_correction_requested();

-- ========================================
-- 7️⃣ FUNÇÃO: Notificar sobre Pagamento
-- ========================================
CREATE OR REPLACE FUNCTION notify_writer_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Notificar redator sobre novo pagamento registrado
  PERFORM create_notification(
    p_user_id := NEW.writer_id,
    p_title := '💰 Pagamento Registrado',
    p_body := format('Pagamento de R$ %.2f referente a %s petições foi registrado.', NEW.total_amount, NEW.petitions_count),
    p_type := 'payment',
    p_priority := 'normal',
    p_related_entity_type := 'payment',
    p_related_entity_id := NEW.id::TEXT
  );
  
  RETURN NEW;
END;
$$;

-- Trigger 3: Notificar quando pagamento é registrado
DROP TRIGGER IF EXISTS trigger_notify_writer_payment ON writer_monthly_payments;
CREATE TRIGGER trigger_notify_writer_payment
AFTER INSERT ON writer_monthly_payments
FOR EACH ROW
EXECUTE FUNCTION notify_writer_payment();

-- ========================================
-- 8️⃣ TESTES
-- ========================================

-- Teste 1: Inserir notificação de teste
-- NOTA: Substitua 'SEU_USER_UID' pelo UID real do redator
/*
SELECT create_notification(
  p_user_id := 'SEU_USER_UID',
  p_title := '🎉 Teste de Notificação',
  p_body := 'Se você está vendo isso, o sistema de notificações está funcionando!',
  p_type := 'system',
  p_priority := 'high'
);
*/

-- Teste 2: Verificar notificações criadas
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
LIMIT 10;

-- Teste 3: Verificar notificações não lidas por usuário
/*
SELECT COUNT(*) as unread_count
FROM app_2d8133c678_notifications
WHERE user_id = 'SEU_USER_UID'
AND is_read = FALSE;
*/

-- ========================================
-- 9️⃣ FUNÇÕES AUXILIARES
-- ========================================

-- Marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE app_2d8133c678_notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = notification_id;
  
  RETURN FOUND;
END;
$$;

-- Marcar todas as notificações de um usuário como lidas
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_user_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE app_2d8133c678_notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id
  AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- ========================================
-- 🔟 LIMPEZA (Opcional)
-- ========================================

-- Função para limpar notificações antigas (90+ dias)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM app_2d8133c678_notifications
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND is_read = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ========================================
-- ✅ CONCLUSÃO
-- ========================================
-- Execute este arquivo no Supabase SQL Editor
-- Depois, teste inserindo uma notificação de teste
-- e verifique se aparece no sino do dashboard do redator

