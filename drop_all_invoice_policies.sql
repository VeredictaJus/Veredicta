-- Script para remover TODAS as políticas RLS da tabela de notas fiscais

-- Remover as políticas que realmente existem (baseado na query anterior)
DROP POLICY IF EXISTS "admin can do everything on invoices" ON app_2d8133c678_invoices;
DROP POLICY IF EXISTS "client can insert own invoice" ON app_2d8133c678_invoices;
DROP POLICY IF EXISTS "client can select own invoice" ON app_2d8133c678_invoices;

-- Verificar se todas foram removidas
SELECT policyname FROM pg_policies WHERE tablename = 'app_2d8133c678_invoices';

-- Agora alterar as colunas
ALTER TABLE app_2d8133c678_invoices ALTER COLUMN submitted_by TYPE TEXT;
ALTER TABLE app_2d8133c678_invoices ALTER COLUMN client_id TYPE TEXT;
ALTER TABLE app_2d8133c678_invoices ALTER COLUMN reviewed_by TYPE TEXT;

-- Verificar as colunas
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'app_2d8133c678_invoices'
  AND column_name IN ('submitted_by', 'client_id', 'reviewed_by');










