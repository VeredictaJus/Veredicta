-- 1. Verificar se a tabela de notificações existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'app_2d8133c678_notifications'
) as notification_table_exists;

-- 2. Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS app_2d8133c678_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type TEXT,
  related_entity_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar RLS para a tabela
ALTER TABLE app_2d8133c678_notifications ENABLE ROW LEVEL SECURITY;

-- 4. Política RLS (permissiva para testes)
CREATE POLICY IF NOT EXISTS "Allow all operations on notifications" ON app_2d8133c678_notifications
FOR ALL USING (true);

-- 5. Inserir uma notificação de teste
INSERT INTO app_2d8133c678_notifications (
  user_id, 
  title, 
  message, 
  type, 
  priority
) VALUES (
  'test-user-123', 
  'Teste de Notificação', 
  'Esta é uma notificação de teste para verificar se o sino está funcionando', 
  'test', 
  'high'
);

-- 6. Verificar se a notificação foi inserida
SELECT * FROM app_2d8133c678_notifications ORDER BY created_at DESC LIMIT 5;