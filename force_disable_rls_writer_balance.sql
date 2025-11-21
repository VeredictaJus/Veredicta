-- ========================================
-- FORÇAR DESATIVAÇÃO TOTAL DE RLS
-- ========================================

-- 1️⃣ Verificar status atual do RLS
SELECT 
  tablename,
  rowsecurity as rls_ativado
FROM pg_tables 
WHERE tablename = 'writer_balance';

-- 2️⃣ Remover TODAS as policies primeiro
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'writer_balance'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON writer_balance', pol.policyname);
    RAISE NOTICE 'Policy removida: %', pol.policyname;
  END LOOP;
END $$;

-- 3️⃣ DESABILITAR RLS
ALTER TABLE writer_balance DISABLE ROW LEVEL SECURITY;

-- 4️⃣ Verificar novamente (deve mostrar false)
SELECT 
  tablename,
  rowsecurity as rls_ativado
FROM pg_tables 
WHERE tablename = 'writer_balance';

-- 5️⃣ Ver se ainda existem policies (deve retornar 0)
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE tablename = 'writer_balance';

-- 6️⃣ TESTAR leitura completa
SELECT * FROM writer_balance;

-- 7️⃣ TESTAR com filtro
SELECT 
  writer_id,
  total_earned,
  available_balance
FROM writer_balance
WHERE writer_id = 'nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2';

