-- Script para verificar a estrutura da tabela de notas fiscais

-- 1. Ver todas as colunas da tabela app_2d8133c678_invoices
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'app_2d8133c678_invoices'
ORDER BY ordinal_position;

-- 2. Ver as primeiras 10 linhas para entender os dados
SELECT *
FROM app_2d8133c678_invoices
ORDER BY created_at DESC
LIMIT 10;

-- 3. Contar total de registros
SELECT COUNT(*) as total_invoices
FROM app_2d8133c678_invoices;










