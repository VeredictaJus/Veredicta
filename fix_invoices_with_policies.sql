-- Script completo para alterar colunas UUID para TEXT
-- Remove políticas RLS, altera colunas, e recria as políticas

-- ========================================
-- PASSO 1: Remover políticas RLS existentes
-- ========================================

-- Ver todas as políticas da tabela primeiro
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'app_2d8133c678_invoices';

-- Remover a política que está bloqueando
DROP POLICY IF EXISTS "client can insert own invoice" ON app_2d8133c678_invoices;

-- Remover outras políticas que possam existir
DROP POLICY IF EXISTS "Users can view own invoices" ON app_2d8133c678_invoices;
DROP POLICY IF EXISTS "Writers can insert invoices" ON app_2d8133c678_invoices;
DROP POLICY IF EXISTS "Admins can view all invoices" ON app_2d8133c678_invoices;

-- ========================================
-- PASSO 2: Alterar colunas de UUID para TEXT
-- ========================================

ALTER TABLE app_2d8133c678_invoices 
  ALTER COLUMN submitted_by TYPE TEXT;

ALTER TABLE app_2d8133c678_invoices 
  ALTER COLUMN client_id TYPE TEXT;

ALTER TABLE app_2d8133c678_invoices 
  ALTER COLUMN reviewed_by TYPE TEXT;

-- ========================================
-- PASSO 3: Verificar alterações
-- ========================================

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'app_2d8133c678_invoices'
  AND column_name IN ('submitted_by', 'client_id', 'reviewed_by')
ORDER BY ordinal_position;

-- ========================================
-- PASSO 4: Recriar políticas RLS (agora com TEXT)
-- ========================================

-- Política: Writers podem inserir suas próprias notas fiscais
CREATE POLICY "Writers can insert own invoices"
ON app_2d8133c678_invoices
FOR INSERT
TO authenticated
WITH CHECK (
  submitted_by IN (
    SELECT firebase_uid 
    FROM user_profiles 
    WHERE id = auth.uid() AND role = 'writer'
  )
);

-- Política: Usuários podem ver suas próprias notas fiscais
CREATE POLICY "Users can view own invoices"
ON app_2d8133c678_invoices
FOR SELECT
TO authenticated
USING (
  submitted_by IN (
    SELECT firebase_uid 
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  OR
  client_id IN (
    SELECT firebase_uid 
    FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- Política: Admins podem ver todas as notas fiscais
CREATE POLICY "Admins can view all invoices"
ON app_2d8133c678_invoices
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política: Admins podem atualizar notas fiscais
CREATE POLICY "Admins can update invoices"
ON app_2d8133c678_invoices
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ========================================
-- PASSO 5: Verificar políticas criadas
-- ========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'app_2d8133c678_invoices'
ORDER BY policyname;

-- ========================================
-- PASSO 6: Habilitar RLS na tabela (se não estiver)
-- ========================================

ALTER TABLE app_2d8133c678_invoices ENABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'app_2d8133c678_invoices';










