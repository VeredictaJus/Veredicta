-- ========================================
-- CORREÇÃO: Coluna 'message' com NOT NULL
-- ========================================
-- A tabela tem tanto 'message' quanto 'body'
-- Vamos tornar 'message' opcional (sem NOT NULL)

-- Opção 1: Remover constraint NOT NULL de 'message'
ALTER TABLE app_2d8133c678_notifications 
ALTER COLUMN message DROP NOT NULL;

-- Opção 2 (Alternativa): Atualizar valores NULL existentes
-- UPDATE app_2d8133c678_notifications 
-- SET message = body 
-- WHERE message IS NULL;

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'app_2d8133c678_notifications'
AND column_name IN ('message', 'body', 'title')
ORDER BY ordinal_position;







