-- Query para verificar a assinatura do usuário
-- Substitua 'SEU_FIREBASE_UID_AQUI' pelo seu UID real

SELECT 
  us.user_id,
  us.plan_code,
  us.status,
  us.created_at,
  us.updated_at,
  us.next_billing_date,
  p.name as plan_name,
  p.petitions_limit,
  p.price
FROM user_subscriptions us
LEFT JOIN plans p ON us.plan_code = p.plan_code
WHERE us.user_id = '9ZM2BtSffobuCXpMKsVmI59jYpD2'  -- Seu UID
  AND us.status = 'active'
ORDER BY us.updated_at DESC
LIMIT 1;

-- Ou para ver todos os usuários com seus planos:
SELECT 
  up.email,
  up.full_name,
  us.plan_code,
  us.status,
  us.updated_at,
  p.name as plan_name,
  p.petitions_limit
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id AND us.status = 'active'
LEFT JOIN plans p ON us.plan_code = p.plan_code
WHERE up.firebase_uid = '9ZM2BtSffobuCXpMKsVmI59jYpD2'  -- Seu UID
ORDER BY us.updated_at DESC;




