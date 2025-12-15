-- Script para verificar notas fiscais existentes e entender por que não aparecem

-- 1. Verificar TODAS as notas fiscais na tabela (independente de data)
SELECT 
  id,
  writer_id,
  writer_name,
  client_name,
  file_path,
  amount,
  status,
  submitted_at,
  created_at,
  updated_at
FROM app_2d8133c678_invoices
ORDER BY submitted_at DESC;

-- 2. Verificar notas dos últimos 30 dias
SELECT 
  id,
  writer_id,
  writer_name,
  file_path,
  status,
  submitted_at,
  CURRENT_TIMESTAMP as agora,
  CURRENT_TIMESTAMP - INTERVAL '30 days' as data_limite_30d,
  (submitted_at >= CURRENT_TIMESTAMP - INTERVAL '30 days') as esta_nos_ultimos_30d
FROM app_2d8133c678_invoices
WHERE submitted_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY submitted_at DESC;

-- 3. Verificar notas dos últimos 6 meses
SELECT 
  id,
  writer_id,
  writer_name,
  file_path,
  status,
  submitted_at,
  CURRENT_TIMESTAMP as agora,
  CURRENT_TIMESTAMP - INTERVAL '6 months' as data_limite_6m,
  (submitted_at >= CURRENT_TIMESTAMP - INTERVAL '6 months') as esta_nos_ultimos_6m
FROM app_2d8133c678_invoices
WHERE submitted_at >= CURRENT_TIMESTAMP - INTERVAL '6 months'
ORDER BY submitted_at DESC;

-- 4. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'app_2d8133c678_invoices'
ORDER BY ordinal_position;

-- 5. Contar total de notas por status
SELECT 
  status,
  COUNT(*) as quantidade,
  MIN(submitted_at) as primeira_nota,
  MAX(submitted_at) as ultima_nota
FROM app_2d8133c678_invoices
GROUP BY status
ORDER BY status;










