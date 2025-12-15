-- ========================================
-- DESABILITAR RLS COMPLETAMENTE
-- ========================================
-- Firebase Auth não é compatível com Supabase RLS policies
-- Precisamos desabilitar RLS para permitir acesso

-- Passo 1: Remover TODAS as policies
DROP POLICY IF EXISTS "allow_all_authenticated_read" ON app_2d8133c678_writer_ratings;
DROP POLICY IF EXISTS "Admins can view all ratings" ON app_2d8133c678_writer_ratings;
DROP POLICY IF EXISTS "Clients can insert ratings for approved petitions" ON app_2d8133c678_writer_ratings;
DROP POLICY IF EXISTS "Clients can view ratings they submitted" ON app_2d8133c678_writer_ratings;
DROP POLICY IF EXISTS "Writers can view their own ratings" ON app_2d8133c678_writer_ratings;

-- Passo 2: DESABILITAR RLS na tabela
ALTER TABLE app_2d8133c678_writer_ratings DISABLE ROW LEVEL SECURITY;

-- Passo 3: Verificar (não deve mostrar nenhuma policy)
SELECT 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename = 'app_2d8133c678_writer_ratings';

-- Passo 4: Verificar se RLS está desabilitado (deve mostrar relrowsecurity = false)
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'app_2d8133c678_writer_ratings';

-- Passo 5: Testar leitura (deve retornar 3 ratings)
SELECT COUNT(*) as total_ratings 
FROM app_2d8133c678_writer_ratings;







