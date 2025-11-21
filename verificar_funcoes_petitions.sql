-- Verificar funções relacionadas a petições
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as funções existem
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_name IN (
  'get_user_petition_stats',
  'get_user_petition_limit', 
  'check_user_can_create_petition',
  'get_monthly_petitions_usage',
  'get_free_petitions_usage'
)
ORDER BY routine_name;

-- 2. Testar a função get_user_petition_stats com um usuário específico
-- Substitua pelo UID real do usuário
SELECT * FROM get_user_petition_stats('yNTB2V36O6WPxVOzlZxLQNV1tCm1');

-- 3. Verificar se há petições na tabela para esse usuário
SELECT 
  COUNT(*) as total_petitions,
  COUNT(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN 1 END) as monthly_petitions
FROM petitions 
WHERE client_id = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1';

-- 4. Verificar dados do usuário
SELECT 
  up.firebase_uid,
  up.credits_balance,
  p.plan_code,
  p.name as plan_name,
  p.petitions_included,
  p.validity_days
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id
LEFT JOIN plans p ON us.plan_id = p.id
WHERE up.firebase_uid = 'yNTB2V36O6WPxVOzlZxLQNV1tCm1';
