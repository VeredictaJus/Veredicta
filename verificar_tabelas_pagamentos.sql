-- Script para verificar quais tabelas de pagamentos existem no banco

-- 1. Verificar todas as tabelas que contém "payment" no nome
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name LIKE '%payment%' 
   OR table_name LIKE '%pagamento%'
ORDER BY table_name;

-- 2. Verificar especificamente a tabela que o código está buscando
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'app_2d8133c678_payments'
    ) 
    THEN '✅ Tabela app_2d8133c678_payments EXISTE'
    ELSE '❌ Tabela app_2d8133c678_payments NÃO EXISTE'
  END as status;

-- 3. Se a tabela existir, mostrar sua estrutura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'app_2d8133c678_payments'
ORDER BY ordinal_position;

-- 4. Se a tabela existir, contar quantos registros tem
SELECT 
  'Total de pagamentos' as info,
  COUNT(*) as quantidade
FROM app_2d8133c678_payments;

-- 5. Verificar outras tabelas relacionadas
SELECT 
  'app_2d8133c678_invoices' as tabela,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_2d8133c678_invoices')
    THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status
UNION ALL
SELECT 
  'stripe_payments' as tabela,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stripe_payments')
    THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status
UNION ALL
SELECT 
  'user_payment_cards' as tabela,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_payment_cards')
    THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status;












