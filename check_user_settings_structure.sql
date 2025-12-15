-- Script para verificar a estrutura real da tabela user_settings
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todas as colunas da tabela user_settings
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position;

-- 2. Verificar se há dados na tabela
SELECT COUNT(*) as total_records FROM user_settings;

-- 3. Verificar se há registros para o usuário específico
SELECT * FROM user_settings WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 4. Verificar políticas atuais
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 5. Testar inserção simples
INSERT INTO user_settings (user_id, email_notifications)
VALUES ('test_user_123', true)
ON CONFLICT (user_id) DO UPDATE SET
    email_notifications = EXCLUDED.email_notifications;

-- 6. Verificar se a inserção funcionou
SELECT * FROM user_settings WHERE user_id = 'test_user_123';

-- 7. Limpar o teste
DELETE FROM user_settings WHERE user_id = 'test_user_123';

























