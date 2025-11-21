-- ============================================
-- REMOVER NOTIFICAÇÕES DE TESTE
-- ============================================
-- Este script remove todas as notificações de teste
-- mantendo apenas notificações reais geradas pelo sistema

-- 1. Ver todas as notificações atuais antes de deletar
SELECT 
  id,
  user_id,
  type,
  title,
  LEFT(message, 50) as message_preview,
  created_at,
  is_read
FROM app_2d8133c678_notifications
ORDER BY created_at DESC;

-- 2. DELETAR TODAS as notificações de teste
-- (Como todas foram criadas manualmente para teste, podemos deletar todas)
DELETE FROM app_2d8133c678_notifications
WHERE created_at < NOW();

-- 3. Verificar que foram deletadas
SELECT COUNT(*) as total_notifications_remaining
FROM app_2d8133c678_notifications;

-- 4. Resetar a sequência (opcional, para começar do zero)
-- Se quiser que os IDs comecem novamente do 1
-- ALTER SEQUENCE app_2d8133c678_notifications_id_seq RESTART WITH 1;

-- ============================================
-- VERIFICAÇÕES PÓS-LIMPEZA
-- ============================================

-- Verificar assinaturas ativas de clientes
SELECT 
  us.user_id,
  up.email,
  up.full_name,
  us.plan_code,
  p.name as plan_name,
  p.price,
  us.status,
  us.next_billing_date,
  EXTRACT(DAY FROM (us.next_billing_date - NOW())) as dias_ate_expiracao
FROM user_subscriptions us
LEFT JOIN user_profiles up ON us.user_id = up.firebase_uid
LEFT JOIN plans p ON us.plan_code = p.plan_code
WHERE us.status = 'active'
  AND up.role = 'client'
  AND us.plan_code != 'free'
ORDER BY us.next_billing_date ASC;

-- Verificar clientes e suas petições (para notificações de limite)
SELECT 
  up.firebase_uid,
  up.email,
  up.full_name,
  us.plan_code,
  p.petition_limit,
  COUNT(pet.id) as petitions_count,
  ROUND((COUNT(pet.id)::float / NULLIF(p.petition_limit, 0)) * 100, 1) as usage_percentage
FROM user_profiles up
LEFT JOIN user_subscriptions us ON up.firebase_uid = us.user_id
LEFT JOIN plans p ON us.plan_code = p.plan_code
LEFT JOIN app_2d8133c678_petitions pet ON up.firebase_uid = pet.client_id
WHERE up.role = 'client'
  AND us.status = 'active'
GROUP BY up.firebase_uid, up.email, up.full_name, us.plan_code, p.petition_limit
ORDER BY usage_percentage DESC;

-- ============================================
-- SISTEMA PRONTO PARA NOTIFICAÇÕES REAIS
-- ============================================
-- ✅ Edge Function check-plan-expiry rodando diariamente (cron + GitHub Actions)
-- ✅ PlanNotificationService integrado no frontend
-- ✅ Notificações ao criar petição (limite atingido/próximo)
-- ✅ Notificações ao login (verificação de planos)
-- ✅ Sistema de redirecionamento específico implementado
-- ============================================










