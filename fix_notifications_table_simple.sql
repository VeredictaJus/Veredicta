-- ========================================
-- CORREÇÃO RÁPIDA: Adicionar Colunas Faltantes
-- ========================================
-- Execute este arquivo para adicionar as colunas que faltam
-- na tabela app_2d8133c678_notifications

-- Adicionar coluna 'body' (mensagem da notificação)
ALTER TABLE app_2d8133c678_notifications 
ADD COLUMN IF NOT EXISTS body TEXT;

-- Adicionar coluna 'read_at' (quando foi lida)
ALTER TABLE app_2d8133c678_notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna 'related_entity_type' (tipo da entidade relacionada)
ALTER TABLE app_2d8133c678_notifications 
ADD COLUMN IF NOT EXISTS related_entity_type TEXT;

-- Adicionar coluna 'related_entity_id' (ID da entidade relacionada)
ALTER TABLE app_2d8133c678_notifications 
ADD COLUMN IF NOT EXISTS related_entity_id TEXT;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'app_2d8133c678_notifications'
ORDER BY ordinal_position;







