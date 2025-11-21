-- ========================================
-- ADICIONAR CONTROLE DE E-MAIL PARA NOTIFICAÇÕES
-- ========================================
-- Este script garante que a tabela de notificações possua
-- um campo para registrar quando o e-mail correspondente foi enviado.

ALTER TABLE app_2d8133c678_notifications
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_notifications_email_pending
ON app_2d8133c678_notifications(user_id)
WHERE email_sent_at IS NULL;






