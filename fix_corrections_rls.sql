-- ========================================
-- CORRIGIR POLÍTICAS RLS DA TABELA CORRECTIONS
-- ========================================
-- 
-- IMPORTANTE: Este projeto usa Firebase Auth, não Supabase Auth
-- Por isso, usamos current_setting('request.jwt.claims') para obter o user_id
--

-- Remover políticas antigas
DROP POLICY IF EXISTS "Redatores podem inserir correções" ON corrections;
DROP POLICY IF EXISTS "Redatores podem ver suas correções" ON corrections;
DROP POLICY IF EXISTS "Admins podem ver todas correções" ON corrections;
DROP POLICY IF EXISTS "Corretores podem atualizar suas correções" ON corrections;
DROP POLICY IF EXISTS "Admins podem atualizar correções" ON corrections;

-- ========================================
-- POLÍTICAS CORRIGIDAS (Firebase Auth)
-- ========================================

-- Função helper para obter o Firebase UID do JWT
CREATE OR REPLACE FUNCTION get_firebase_uid()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>'sub';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Política: Redatores podem inserir suas próprias correções
CREATE POLICY "Redatores podem inserir correções"
  ON corrections
  FOR INSERT
  WITH CHECK (
    user_id = get_firebase_uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles_v2 
      WHERE firebase_uid = get_firebase_uid()
      AND role IN ('writer', 'admin')
    )
  );

-- Política: Redatores podem ver suas próprias correções
CREATE POLICY "Redatores podem ver suas correções"
  ON corrections
  FOR SELECT
  USING (
    user_id = get_firebase_uid()
  );

-- Política: Admins podem ver TODAS as correções
CREATE POLICY "Admins podem ver todas correções"
  ON corrections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles_v2 
      WHERE firebase_uid = get_firebase_uid()
      AND role = 'admin'
    )
  );

-- Política: Admins podem atualizar TODAS as correções
CREATE POLICY "Admins podem atualizar correções"
  ON corrections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles_v2 
      WHERE firebase_uid = get_firebase_uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles_v2 
      WHERE firebase_uid = get_firebase_uid()
      AND role = 'admin'
    )
  );

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'corrections'
ORDER BY policyname;

