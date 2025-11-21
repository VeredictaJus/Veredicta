-- Script para limpar usuários de teste
-- ATENÇÃO: Este script irá deletar TODOS os usuários de teste!

-- 1. Deletar perfis de usuários de teste da tabela user_profiles
DELETE FROM user_profiles 
WHERE email LIKE '%teste%' 
   OR email LIKE '%@exemplo.com'
   OR email LIKE '%@teste.com.br'
   OR firebase_uid IN (
       'rn9RWTMFJEMF2lc5kI8dSlTchZb2',
       'G0KydzOmQwWZDuDvr4noSqY7fTw2',
       'jz2qSob7FmWtt0FGZeyn15QXCg62'
   );

-- 2. Verificar quantos usuários foram deletados
SELECT 
    COUNT(*) as total_deleted,
    'user_profiles' as table_name
FROM user_profiles 
WHERE email LIKE '%teste%' 
   OR email LIKE '%@exemplo.com'
   OR email LIKE '%@teste.com.br';

-- 3. Listar usuários restantes (para verificação)
SELECT 
    firebase_uid,
    email,
    role,
    status,
    created_at
FROM user_profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar se há outros dados relacionados que precisam ser limpos
-- (opcional - descomente se necessário)

-- DELETE FROM conversations WHERE user_id IN (
--     SELECT firebase_uid FROM user_profiles 
--     WHERE email LIKE '%teste%' OR email LIKE '%@exemplo.com'
-- );

-- DELETE FROM petitions WHERE user_id IN (
--     SELECT firebase_uid FROM user_profiles 
--     WHERE email LIKE '%teste%' OR email LIKE '%@exemplo.com'
-- );

-- DELETE FROM payments WHERE user_id IN (
--     SELECT firebase_uid FROM user_profiles 
--     WHERE email LIKE '%teste%' OR email LIKE '%@exemplo.com'
-- );















