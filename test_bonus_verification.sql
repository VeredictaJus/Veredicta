-- VERIFICAÇÃO DOS TESTES DE BÔNUS FREE
-- Execute estes scripts APÓS cada teste

-- 1. Verificar usuários e planos ativos
SELECT 
  up.email,
  up.role,
  up.cnpj,
  up.cpf,
  us.plan_code,
  us.status,
  us.is_bonus,
  us.created_at as subscription_created
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id
WHERE up.email LIKE '%teste%'
ORDER BY up.created_at DESC;

-- 2. Verificar especificamente bônus FREE
SELECT 
  up.email,
  us.plan_code,
  us.is_bonus,
  us.status,
  CASE 
    WHEN us.is_bonus = true THEN '🎁 BÔNUS ATIVO'
    WHEN us.plan_code = 'free' AND us.is_bonus = false THEN '🆓 FREE NORMAL'
    WHEN us.plan_code != 'free' THEN '💰 PLANO PAGO'
    ELSE '❌ SEM PLANO'
  END as status_plano
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id
WHERE up.email LIKE '%teste%'
ORDER BY up.created_at DESC;

-- 3. Verificar se há duplicatas de FREE por CPF/CNPJ
SELECT 
  up.cnpj,
  up.cpf,
  COUNT(*) as total_free_plans,
  COUNT(CASE WHEN us.is_bonus = true THEN 1 END) as bonus_plans,
  COUNT(CASE WHEN us.is_bonus = false THEN 1 END) as normal_plans
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id
WHERE us.plan_code = 'free'
GROUP BY up.cnpj, up.cpf
HAVING COUNT(*) > 1
ORDER BY total_free_plans DESC;









