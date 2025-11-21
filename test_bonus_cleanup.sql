-- LIMPEZA PARA TESTE DO BÔNUS FREE
-- Execute este script no Supabase SQL Editor ANTES dos testes

-- 1. Deletar usuários de teste (substitua pelos emails que você vai usar)
DELETE FROM user_profiles 
WHERE email IN (
  'teste1@exemplo.com',
  'teste2@exemplo.com', 
  'teste3@exemplo.com'
);

-- 2. Deletar assinaturas de teste
DELETE FROM user_subscriptions 
WHERE user_id IN (
  'teste1@exemplo.com',
  'teste2@exemplo.com',
  'teste3@exemplo.com'
);

-- 3. Verificar limpeza
SELECT 
  up.email,
  up.role,
  us.plan_code,
  us.is_bonus,
  us.status
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id
WHERE up.email LIKE '%teste%'
ORDER BY up.created_at DESC;









