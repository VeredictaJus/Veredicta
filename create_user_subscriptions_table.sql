-- Criar tabela user_subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários só podem ver suas próprias assinaturas
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid()::text);

-- Política RLS: usuários só podem inserir suas próprias assinaturas
CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Política RLS: usuários só podem atualizar suas próprias assinaturas
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Política RLS: usuários só podem deletar suas próprias assinaturas
CREATE POLICY "Users can delete their own subscriptions" ON user_subscriptions
  FOR DELETE USING (user_id = auth.uid()::text);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- Inserir dados de exemplo para teste
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date)
VALUES 
  ('yNTB2V3606WPxVOzLZxLQNV1tCm1', 'free', 'active', NOW(), NULL),
  ('yNTB2V3606WPxVOzLZxLQNV1tCm1', 'professional', 'inactive', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Comentários na tabela
COMMENT ON TABLE user_subscriptions IS 'Tabela de assinaturas dos usuários';
COMMENT ON COLUMN user_subscriptions.user_id IS 'ID do usuário (Firebase UID)';
COMMENT ON COLUMN user_subscriptions.plan_id IS 'ID do plano (free, professional, enterprise)';
COMMENT ON COLUMN user_subscriptions.status IS 'Status da assinatura (active, inactive, cancelled, expired)';
COMMENT ON COLUMN user_subscriptions.stripe_subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN user_subscriptions.stripe_customer_id IS 'ID do cliente no Stripe';





















