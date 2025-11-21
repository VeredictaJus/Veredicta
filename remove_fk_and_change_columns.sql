-- Script para remover foreign keys, alterar colunas e recriar constraints

-- ========================================
-- PASSO 1: Ver todas as foreign keys da tabela
-- ========================================
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'app_2d8133c678_invoices';

-- ========================================
-- PASSO 2: Remover as foreign keys
-- ========================================
ALTER TABLE app_2d8133c678_invoices 
  DROP CONSTRAINT IF EXISTS app_2d8133c678_invoices_submitted_by_fkey;

ALTER TABLE app_2d8133c678_invoices 
  DROP CONSTRAINT IF EXISTS app_2d8133c678_invoices_client_id_fkey;

ALTER TABLE app_2d8133c678_invoices 
  DROP CONSTRAINT IF EXISTS app_2d8133c678_invoices_reviewed_by_fkey;

-- ========================================
-- PASSO 3: Alterar as colunas para TEXT
-- ========================================
ALTER TABLE app_2d8133c678_invoices 
  ALTER COLUMN submitted_by TYPE TEXT;

ALTER TABLE app_2d8133c678_invoices 
  ALTER COLUMN client_id TYPE TEXT;

ALTER TABLE app_2d8133c678_invoices 
  ALTER COLUMN reviewed_by TYPE TEXT;

-- ========================================
-- PASSO 4: Verificar alterações
-- ========================================
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'app_2d8133c678_invoices'
  AND column_name IN ('submitted_by', 'client_id', 'reviewed_by');

-- ========================================
-- PASSO 5: Recriar foreign keys (opcional, se necessário)
-- ========================================
-- Se você quiser manter as foreign keys, descomente estas linhas:
/*
-- Assumindo que as foreign keys apontam para user_profiles.firebase_uid
ALTER TABLE app_2d8133c678_invoices
  ADD CONSTRAINT app_2d8133c678_invoices_submitted_by_fkey
  FOREIGN KEY (submitted_by) REFERENCES user_profiles(firebase_uid);

ALTER TABLE app_2d8133c678_invoices
  ADD CONSTRAINT app_2d8133c678_invoices_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES user_profiles(firebase_uid);
*/

-- ========================================
-- PASSO 6: Verificar que não há mais foreign keys
-- ========================================
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'app_2d8133c678_invoices'
  AND constraint_type = 'FOREIGN KEY';










