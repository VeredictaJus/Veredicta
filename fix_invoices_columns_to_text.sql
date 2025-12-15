-- Script para alterar colunas UUID para TEXT na tabela de notas fiscais
-- Isso resolve o problema de incompatibilidade entre Firebase UID (string) e UUID (formato específico)

-- 1. Alterar submitted_by de UUID para TEXT
ALTER TABLE app_2d8133c678_invoices 
  ALTER COLUMN submitted_by TYPE TEXT;

-- 2. Alterar client_id de UUID para TEXT  
ALTER TABLE app_2d8133c678_invoices 
  ALTER COLUMN client_id TYPE TEXT;

-- 3. Alterar reviewed_by de UUID para TEXT (se precisar)
ALTER TABLE app_2d8133c678_invoices 
  ALTER COLUMN reviewed_by TYPE TEXT;

-- 4. Verificar a estrutura atualizada
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'app_2d8133c678_invoices'
  AND column_name IN ('submitted_by', 'client_id', 'reviewed_by')
ORDER BY ordinal_position;

-- 5. Testar se agora aceita Firebase UID
-- (Executar este INSERT apenas para teste, depois pode deletar)
/*
INSERT INTO app_2d8133c678_invoices (
  submitted_by,
  client_id,
  period_year,
  period_month,
  amount,
  file_path,
  status
) VALUES (
  'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2',
  'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2',
  2025,
  10,
  0,
  'test/test.pdf',
  'submitted'
);

-- Ver o registro criado
SELECT * FROM app_2d8133c678_invoices ORDER BY submitted_at DESC LIMIT 1;

-- Deletar o teste
DELETE FROM app_2d8133c678_invoices WHERE file_path = 'test/test.pdf';
*/










