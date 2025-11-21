-- Script de Verificação Final do Sistema de Planos
-- Execute este script para verificar se tudo está funcionando

-- 1. Verificar total de usuários
SELECT 
  'Total de usuários no sistema' as categoria,
  COUNT(*) as total_usuarios
FROM user_profiles;

-- 2. Verificar usuários com assinaturas ativas
SELECT 
  'Usuários com assinaturas ativas' as categoria,
  COUNT(DISTINCT user_id) as usuarios_com_assinatura
FROM user_subscriptions 
WHERE status = 'active';

-- 3. Listar todos os usuários e seus status
SELECT 
  'Status de assinatura por usuário' as categoria,
  up.firebase_uid,
  up.full_name,
  up.email,
  up.role,
  CASE 
    WHEN us.status = 'active' THEN 'ATIVO'
    WHEN us.status = 'cancelled' THEN 'CANCELADO'
    WHEN us.status = 'expired' THEN 'EXPIRADO'
    WHEN us.user_id IS NULL THEN 'SEM ASSINATURA'
    ELSE 'DESCONHECIDO'
  END as status_assinatura,
  us.plan_code,
  p.name as plan_name,
  p.petitions_limit
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id
LEFT JOIN plans p ON us.plan_code = p.plan_code
ORDER BY up.created_at DESC;

-- 4. Testar função get_user_active_plan para cliente
SELECT 
  'Teste função para cliente' as categoria,
  'get_user_active_plan' as funcao,
  firebase_uid,
  get_user_active_plan(firebase_uid) as resultado
FROM user_profiles 
WHERE role = 'client' OR role = 'advogado'
LIMIT 1;

-- 5. Verificar RLS (Row Level Security)
SELECT 
  'Verificação de RLS' as categoria,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('user_subscriptions', 'plans', 'user_profiles')
ORDER BY tablename, policyname;




















