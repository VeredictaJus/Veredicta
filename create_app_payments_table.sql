-- Script para criar a tabela app_2d8133c678_payments para o sistema de pagamentos do writer
-- Esta é a tabela que o componente Payments.tsx do writer está tentando buscar

CREATE TABLE IF NOT EXISTS app_2d8133c678_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- IDs das entidades relacionadas
  petition_id UUID REFERENCES petitions(id),
  writer_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  
  -- Dados do pagamento
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'cancelled'
  payment_method TEXT DEFAULT 'card', -- 'card', 'pix', 'bank_transfer', etc
  payment_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  reference TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_app_payments_writer_id ON app_2d8133c678_payments(writer_id);
CREATE INDEX IF NOT EXISTS idx_app_payments_client_id ON app_2d8133c678_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_app_payments_petition_id ON app_2d8133c678_payments(petition_id);
CREATE INDEX IF NOT EXISTS idx_app_payments_status ON app_2d8133c678_payments(status);
CREATE INDEX IF NOT EXISTS idx_app_payments_created_at ON app_2d8133c678_payments(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE app_2d8133c678_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permitir que usuários vejam seus próprios pagamentos
-- Writers podem ver seus próprios pagamentos
CREATE POLICY "Writers can view their own payments" ON app_2d8133c678_payments
  FOR SELECT
  USING (
    writer_id = auth.uid()::text OR 
    writer_id IN (SELECT firebase_uid FROM user_profiles WHERE id = auth.uid())
  );

-- Clients podem ver pagamentos de suas petições
CREATE POLICY "Clients can view payments for their petitions" ON app_2d8133c678_payments
  FOR SELECT
  USING (
    client_id = auth.uid()::text OR
    client_id IN (SELECT firebase_uid FROM user_profiles WHERE id = auth.uid())
  );

-- Admins podem ver todos os pagamentos
CREATE POLICY "Admins can view all payments" ON app_2d8133c678_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Permitir inserção para admins
CREATE POLICY "Admins can insert payments" ON app_2d8133c678_payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Permitir atualização para admins
CREATE POLICY "Admins can update payments" ON app_2d8133c678_payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Mostrar estrutura criada
SELECT 
  'app_2d8133c678_payments criada com sucesso' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'app_2d8133c678_payments'
ORDER BY ordinal_position;












