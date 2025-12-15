-- Create plans table for centralized plan management
-- This table will be used by both admin and client areas

CREATE TABLE IF NOT EXISTS plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  price decimal(10,2) NOT NULL,
  petitions_included integer NOT NULL,
  additional_credit_price decimal(10,2) DEFAULT 220.00,
  features text[] NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  subscribers integer DEFAULT 0,
  description text,
  priority_support boolean DEFAULT false,
  custom_branding boolean DEFAULT false,
  recommended boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_price ON plans(price);
CREATE INDEX IF NOT EXISTS idx_plans_created_at ON plans(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "allow_everyone_read_active_plans" ON plans;
DROP POLICY IF EXISTS "allow_admins_manage_plans" ON plans;

-- RLS Policies for plans
-- Allow everyone to read active plans (for public display)
CREATE POLICY "allow_everyone_read_active_plans" ON plans
FOR SELECT USING (is_active = true);

-- Allow admins to manage all plans (create, update, delete)
CREATE POLICY "allow_admins_manage_plans" ON plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_plans_updated_at();

-- Grant necessary permissions
GRANT ALL ON plans TO authenticated;
GRANT ALL ON plans TO service_role;

-- Insert default plans if table is empty
INSERT INTO plans (name, price, petitions_included, additional_credit_price, features, recommended, description, priority_support, custom_branding) 
SELECT * FROM (VALUES 
  (
    'Start',
    520.00,
    4,
    130.00,
    ARRAY[
      '4 petições incluídas',
      'Até 3 dias úteis por entrega',
      '1 revisão gratuita no pacote',
      'Consulta com redator e chat incluso',
      'Validade: 30 dias',
      'Confidencialidade garantida (NDA)'
    ],
    false,
    'Ideal para testar ou resolver demandas pontuais',
    false,
    false
  ),
  (
    'Pro',
    1680.00,
    14,
    120.00,
    ARRAY[
      '14 petições incluídas',
      'Entregas em até 2 dias úteis',
      '1 revisão gratuita por petição',
      'Consulta com redator e chat incluso',
      '+1 petição bônus na renovação',
      'Validade: 60 dias',
      'Confidencialidade garantida (NDA)'
    ],
    true,
    'Perfeito para escritórios com fluxo recorrente',
    true,
    false
  ),
  (
    'Elite',
    7000.00,
    70,
    100.00,
    ARRAY[
      '70 petições incluídas',
      'Entrega em até 1 dia útil (prioridade máxima)',
      '1 revisão gratuita por petição',
      'Revisão extra por advogado sênior (opcional)',
      'Consulta direta com redator via plataforma',
      '+3 petições bônus na renovação',
      'Acesso antecipado a novos recursos',
      'Validade: 90 dias',
      'Confidencialidade garantida (NDA)'
    ],
    false,
    'Para grandes bancas e departamentos jurídicos',
    true,
    true
  )
) AS t(name, price, petitions_included, additional_credit_price, features, recommended, description, priority_support, custom_branding)
WHERE NOT EXISTS (SELECT 1 FROM plans LIMIT 1);
