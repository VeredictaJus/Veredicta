-- Script simples para adicionar suporte ao status 'approved'
-- Não usa enums, apenas garante que a coluna aceita o novo valor

-- 1. Verificar a estrutura atual da coluna status
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'petitions' 
  AND column_name = 'status';

-- 2. Se a coluna for TEXT ou VARCHAR, já aceita 'approved' automaticamente
-- Apenas vamos verificar se existe alguma constraint que limita os valores

SELECT 
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'petitions'
  AND con.contype = 'c' -- check constraints
  AND pg_get_constraintdef(con.oid) LIKE '%status%';

-- 3. Se houver uma constraint CHECK que limita os valores de status,
--    precisamos remover e recriar com o novo valor 'approved'

-- Exemplo: se encontrar algo como petitions_status_check, execute:
-- ALTER TABLE petitions DROP CONSTRAINT petitions_status_check;
-- 
-- ALTER TABLE petitions ADD CONSTRAINT petitions_status_check 
-- CHECK (status IN ('pending', 'available', 'assigned', 'in_progress', 
--                   'pending_review', 'revision', 'delivered', 'approved', 
--                   'completed', 'cancelled'));

-- 4. Comentário na tabela
COMMENT ON COLUMN petitions.status IS 'Status da petição: pending, available, assigned, in_progress, pending_review, revision, delivered, approved, completed, cancelled';

-- 5. Verificar se já existe alguma petição com status 'approved'
SELECT COUNT(*) as total_approved
FROM petitions
WHERE status = 'approved';









