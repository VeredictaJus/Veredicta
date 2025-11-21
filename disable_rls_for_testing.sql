-- Script para DESABILITAR RLS temporariamente e testar

-- DESABILITAR RLS
ALTER TABLE app_2d8133c678_invoices DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'app_2d8133c678_invoices';

-- Ver os dados
SELECT COUNT(*) as total FROM app_2d8133c678_invoices;










