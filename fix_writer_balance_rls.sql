-- ========================================
-- CORRIGIR RLS DA TABELA writer_balance
-- ========================================

-- 1️⃣ Verificar RLS atual
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'writer_balance';

-- 2️⃣ Desabilitar RLS (temporário, como fizemos com ratings)
-- Firebase Auth não funciona com Supabase RLS
ALTER TABLE writer_balance DISABLE ROW LEVEL SECURITY;

-- 3️⃣ Verificar se desabilitou
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'writer_balance';

-- 4️⃣ Testar leitura (deve retornar o saldo)
SELECT 
  writer_id,
  total_earned,
  available_balance,
  penalties_total
FROM writer_balance
WHERE writer_id = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';







