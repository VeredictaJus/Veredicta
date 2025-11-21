-- ============================================
-- VERIFICAR LOGS DA EDGE FUNCTION
-- ============================================

-- Ver notificações criadas pelo sistema de planos
SELECT 
    id,
    user_id,
    type,
    title,
    message,
    priority,
    is_read,
    created_at
FROM app_2d8133c678_notifications
WHERE type IN (
    'plan_limit_reached',
    'plan_near_limit',
    'plan_expiring_soon',
    'plan_expired',
    'plan_renewed'
)
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- VERIFICAR ASSINATURAS EXPIRANDO
-- ============================================

-- Ver assinaturas que vão expirar nos próximos 7 dias
SELECT 
    s.user_id,
    u.email,
    u.full_name,
    s.plan_code,
    p.name as plan_name,
    s.status,
    s.next_billing_date,
    EXTRACT(DAY FROM (s.next_billing_date - NOW())) as days_until_expiry
FROM user_subscriptions s
LEFT JOIN user_profiles u ON u.firebase_uid = s.user_id
LEFT JOIN plans p ON p.plan_code = s.plan_code
WHERE s.status = 'active'
    AND s.next_billing_date IS NOT NULL
    AND s.next_billing_date <= NOW() + INTERVAL '7 days'
ORDER BY s.next_billing_date;

-- ============================================
-- VERIFICAR ASSINATURAS EXPIRADAS
-- ============================================

SELECT 
    s.user_id,
    u.email,
    s.plan_code,
    s.status,
    s.next_billing_date
FROM user_subscriptions s
LEFT JOIN user_profiles u ON u.firebase_uid = s.user_id
WHERE s.status = 'expired'
    OR (s.status = 'active' AND s.next_billing_date < NOW())
ORDER BY s.next_billing_date DESC;

-- ============================================
-- ESTATÍSTICAS GERAIS
-- ============================================

SELECT 
    'Total de assinaturas ativas' as metrica,
    COUNT(*) as valor
FROM user_subscriptions
WHERE status = 'active'

UNION ALL

SELECT 
    'Assinaturas expirando em 7 dias',
    COUNT(*)
FROM user_subscriptions
WHERE status = 'active'
    AND next_billing_date <= NOW() + INTERVAL '7 days'

UNION ALL

SELECT 
    'Assinaturas expiradas',
    COUNT(*)
FROM user_subscriptions
WHERE status = 'expired'

UNION ALL

SELECT 
    'Notificações de plano criadas hoje',
    COUNT(*)
FROM app_2d8133c678_notifications
WHERE type IN ('plan_limit_reached', 'plan_near_limit', 'plan_expiring_soon', 'plan_expired', 'plan_renewed')
    AND created_at >= CURRENT_DATE;










