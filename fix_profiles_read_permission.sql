-- Permitir que usuários autenticados leiam perfis de outros usuários
-- Necessário para exibir avatares no chat

-- 1. Verificar políticas atuais
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles_v2'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- 2. Remover política se já existir (para evitar conflito)
DROP POLICY IF EXISTS "authenticated_users_can_read_all_profiles" ON profiles_v2;

-- 3. Criar política para permitir leitura de todos os perfis (case-insensitive)
-- Esta política permite que qualquer usuário autenticado leia qualquer perfil
-- Necessário para chat, avatares, etc.
CREATE POLICY "authenticated_users_can_read_all_profiles" ON profiles_v2
  FOR SELECT
  USING (
    -- Qualquer usuário autenticado pode ler qualquer perfil
    auth.role() = 'authenticated'
    OR
    -- Ou service role (admin)
    auth.role() = 'service_role'
  );

-- 4. Criar índice case-insensitive para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_v2_firebase_uid_upper 
ON profiles_v2 (UPPER(firebase_uid));

-- 5. Verificar se a política foi criada
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles_v2'
  AND policyname = 'authenticated_users_can_read_all_profiles';

-- 6. Teste: Ver se consegue ler os perfis
SELECT 
  firebase_uid,
  email,
  full_name,
  avatar_url,
  role
FROM profiles_v2
WHERE email LIKE '%natalia%'
ORDER BY email;

