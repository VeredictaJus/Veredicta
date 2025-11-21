-- Script para adicionar plano Free
-- Execute este script no Supabase Dashboard

-- Inserir plano Free
INSERT INTO plans (
  name,
  price,
  petitions_included,
  features,
  description,
  priority_support,
  custom_branding,
  is_active,
  subscribers
) VALUES (
  'Free',
  0.00,
  1,
  ARRAY[
    '1 petição gratuita',
    'Entrega em 3-5 dias úteis',
    '1 revisão gratuita',
    'Consulta com redator e chat incluso',
    'Validade: 7 dias',
    'Confidencialidade garantida (NDA)'
  ],
  'Perfeito para testar nossa plataforma',
  false,
  false,
  true,
  0
);

-- Verificar se o plano foi inserido
SELECT 
  id,
  name,
  price,
  petitions_included,
  is_active,
  created_at
FROM plans 
WHERE name = 'Free';

-- Verificar todos os planos ordenados por preço
SELECT 
  id,
  name,
  price,
  petitions_included,
  is_active
FROM plans 
ORDER BY price ASC;
