-- Verificar tabelas de notificações existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%notification%';

-- Verificar se existe a tabela app_2d8133c678_notifications
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'app_2d8133c678_notifications'
) as table_exists;

-- Se a tabela existir, verificar sua estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'app_2d8133c678_notifications'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_notifications
FROM app_2d8133c678_notifications;

-- Verificar notificações não lidas
SELECT COUNT(*) as unread_notifications
FROM app_2d8133c678_notifications
WHERE is_read = false;























