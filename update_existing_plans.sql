-- Update existing plans with correct values
-- Execute this script if you already have plans in your database

-- Update Start plan
UPDATE plans 
SET 
  price = 520.00,
  petitions_included = 4,
  additional_credit_price = 130.00,
  features = ARRAY[
    '4 petições incluídas',
    'Até 3 dias úteis por entrega',
    '1 revisão gratuita no pacote',
    'Consulta com redator e chat incluso',
    'Validade: 30 dias',
    'Confidencialidade garantida (NDA)'
  ],
  description = 'Ideal para testar ou resolver demandas pontuais',
  priority_support = false,
  custom_branding = false,
  recommended = false
WHERE name = 'Start';

-- Update Pro plan (formerly Profissional)
UPDATE plans 
SET 
  name = 'Pro',
  price = 1680.00,
  petitions_included = 14,
  additional_credit_price = 120.00,
  features = ARRAY[
    '14 petições incluídas',
    'Entregas em até 2 dias úteis',
    '1 revisão gratuita por petição',
    'Consulta com redator e chat incluso',
    '+1 petição bônus na renovação',
    'Validade: 60 dias',
    'Confidencialidade garantida (NDA)'
  ],
  description = 'Perfeito para escritórios com fluxo recorrente',
  priority_support = true,
  custom_branding = false,
  recommended = true
WHERE name = 'Profissional' OR name = 'Pro';

-- Update Elite plan (formerly Premium)
UPDATE plans 
SET 
  name = 'Elite',
  price = 7000.00,
  petitions_included = 70,
  additional_credit_price = 100.00,
  features = ARRAY[
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
  description = 'Para grandes bancas e departamentos jurídicos',
  priority_support = true,
  custom_branding = true,
  recommended = false
WHERE name = 'Premium' OR name = 'Elite';

-- Delete Enterprise plan if it exists (not needed anymore)
DELETE FROM plans WHERE name = 'Enterprise';

-- Update updated_at timestamp
UPDATE plans SET updated_at = timezone('utc'::text, now());
