-- Inserir planos corretos na tabela existente
-- Execute este script no Supabase Dashboard

-- Limpar dados existentes (opcional)
DELETE FROM plans;

-- Inserir os planos corretos
INSERT INTO plans (name, price, petitions_included, features, description, priority_support, custom_branding, is_active, subscribers) VALUES 
(
  'Start',
  520,
  4,
  ARRAY[
    '4 petições incluídas',
    'Até 3 dias úteis por entrega',
    '1 revisão gratuita no pacote',
    'Consulta com redator e chat incluso',
    'Validade: 30 dias',
    'Confidencialidade garantida (NDA)'
  ],
  'Ideal para testar ou resolver demandas pontuais',
  false,
  false,
  true,
  0
),
(
  'Pro',
  1680,
  14,
  ARRAY[
    '14 petições incluídas',
    'Entregas em até 2 dias úteis',
    '1 revisão gratuita por petição',
    'Consulta com redator e chat incluso',
    '+1 petição bônus na renovação',
    'Validade: 60 dias',
    'Confidencialidade garantida (NDA)'
  ],
  'Perfeito para escritórios com fluxo recorrente',
  true,
  false,
  true,
  0
),
(
  'Elite',
  7000,
  70,
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
  'Para grandes bancas e departamentos jurídicos',
  true,
  true,
  true,
  0
);

-- Verificar se os dados foram inseridos
SELECT 
  id,
  name,
  price,
  petitions_included,
  is_active,
  created_at
FROM plans 
ORDER BY price;
