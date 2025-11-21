-- ========================================
-- ADICIONAR CONTROLE DE NOTIFICAÇÃO DE SUSPENSÃO
-- ========================================
-- Executar este script após aplicar o sistema de suspensão
-- Ele garante que existe um campo para registrar quando o e-mail
-- de suspensão foi disparado para o redator.

ALTER TABLE profiles_v2
ADD COLUMN IF NOT EXISTS suspension_email_sent_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles_v2
ADD COLUMN IF NOT EXISTS suspension_type TEXT DEFAULT NULL;

-- Opcional: criar índice para consultas do job de notificação
CREATE INDEX IF NOT EXISTS idx_profiles_v2_suspension_email
ON profiles_v2(firebase_uid, suspension_email_sent_at)
WHERE suspension_email_sent_at IS NULL;






