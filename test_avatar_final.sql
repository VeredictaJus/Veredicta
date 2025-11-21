-- Teste final para verificar se o avatar funciona para TODOS os usuários
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a coluna avatar_url existe e está funcionando
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'avatar_url';

-- 2. Testar atualização de avatar para o usuário atual
UPDATE user_profiles 
SET avatar_url = 'data:image/png;base64,teste_avatar_funcionando' 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 3. Verificar se a atualização funcionou
SELECT firebase_uid, email, full_name, avatar_url 
FROM user_profiles 
WHERE firebase_uid = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 4. Verificar todos os usuários e seus avatars
SELECT firebase_uid, email, role, full_name, 
       CASE 
         WHEN avatar_url IS NOT NULL THEN 'Avatar configurado'
         ELSE 'Sem avatar'
       END as avatar_status
FROM user_profiles 
ORDER BY role, email;

-- 5. Verificar se as políticas RLS estão ativas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

























