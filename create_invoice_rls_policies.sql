-- Script para criar políticas RLS para a tabela de notas fiscais
-- Isso permite que admins vejam todas as notas e writers vejam apenas as suas

-- ========================================
-- PASSO 1: Verificar se RLS está habilitado
-- ========================================
ALTER TABLE app_2d8133c678_invoices ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PASSO 2: Remover políticas antigas (se existirem)
-- ========================================
DROP POLICY IF EXISTS "Admins can view all invoices" ON app_2d8133c678_invoices;
DROP POLICY IF EXISTS "Writers can insert own invoices" ON app_2d8133c678_invoices;
DROP POLICY IF EXISTS "Users can view own invoices" ON app_2d8133c678_invoices;
DROP POLICY IF EXISTS "Admins can update invoices" ON app_2d8133c678_invoices;

-- ========================================
-- PASSO 3: Criar política para ADMINS (ver tudo)
-- ========================================
CREATE POLICY "Admins can do everything on invoices"
ON app_2d8133c678_invoices
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
);

-- ========================================
-- PASSO 4: Criar política para WRITERS (inserir)
-- ========================================
CREATE POLICY "Writers can insert own invoices"
ON app_2d8133c678_invoices
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'writer'
    AND user_profiles.firebase_uid = app_2d8133c678_invoices.submitted_by
  )
);

-- ========================================
-- PASSO 5: Criar política para WRITERS/USERS (ver próprias)
-- ========================================
CREATE POLICY "Users can view own invoices"
ON app_2d8133c678_invoices
FOR SELECT
TO authenticated
USING (
  submitted_by IN (
    SELECT firebase_uid 
    FROM user_profiles 
    WHERE user_profiles.id = auth.uid()
  )
);

-- ========================================
-- PASSO 6: Verificar políticas criadas
-- ========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'app_2d8133c678_invoices'
ORDER BY policyname;

-- ========================================
-- PASSO 7: Testar se há registros na tabela
-- ========================================
SELECT COUNT(*) as total_registros
FROM app_2d8133c678_invoices;

-- ========================================
-- PASSO 8: Ver todos os registros (como admin via service role)
-- ========================================
SELECT 
  id,
  submitted_by,
  period_year,
  period_month,
  file_path,
  status,
  submitted_at
FROM app_2d8133c678_invoices
ORDER BY submitted_at DESC;










