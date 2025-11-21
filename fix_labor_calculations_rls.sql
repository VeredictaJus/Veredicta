-- ========================================
-- 🔧 CORRIGIR POLÍTICAS RLS - labor_calculations
-- ========================================
-- Problema: Políticas verificam auth.uid() (Supabase Auth)
-- Solução: Verificar apenas se user_id existe em user_profiles (Firebase Auth)

-- 1️⃣ REMOVER POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Users can view their own calculations" ON labor_calculations;
DROP POLICY IF EXISTS "Users can insert their own calculations" ON labor_calculations;
DROP POLICY IF EXISTS "Users can update their own calculations" ON labor_calculations;
DROP POLICY IF EXISTS "Users can delete their own calculations" ON labor_calculations;

-- 2️⃣ CRIAR NOVAS POLÍTICAS (compatíveis com Firebase Auth)

-- SELECT: Usuário pode ver cálculos onde user_id é um firebase_uid válido
CREATE POLICY "Users can view their own calculations" ON labor_calculations
  FOR SELECT
  USING (
    user_id IN (SELECT firebase_uid FROM user_profiles WHERE firebase_uid = user_id)
  );

-- INSERT: Permitir inserção se user_id é um firebase_uid válido
CREATE POLICY "Users can insert their own calculations" ON labor_calculations
  FOR INSERT
  WITH CHECK (
    user_id IN (SELECT firebase_uid FROM user_profiles WHERE firebase_uid = user_id)
  );

-- UPDATE: Permitir atualização se user_id é um firebase_uid válido
CREATE POLICY "Users can update their own calculations" ON labor_calculations
  FOR UPDATE
  USING (
    user_id IN (SELECT firebase_uid FROM user_profiles WHERE firebase_uid = user_id)
  );

-- DELETE: Permitir exclusão se user_id é um firebase_uid válido
CREATE POLICY "Users can delete their own calculations" ON labor_calculations
  FOR DELETE
  USING (
    user_id IN (SELECT firebase_uid FROM user_profiles WHERE firebase_uid = user_id)
  );

-- ✅ POLÍTICAS CORRIGIDAS!
-- As políticas agora funcionam com Firebase Auth
-- Verificam apenas se o user_id existe na tabela user_profiles

-- 3️⃣ VERIFICAR SE FUNCIONOU
-- Execute esta query para testar:
-- SELECT * FROM labor_calculations WHERE user_id = 'SEU_USER_ID_AQUI';









