-- SCRIPT COMPLETO PARA CORRIGIR TODOS OS USUÁRIOS
-- Execute este script no Supabase SQL Editor

-- ==============================================
-- PARTE 1: DIAGNÓSTICO INICIAL
-- ==============================================

-- Verificar estado atual
SELECT 'DIAGNÓSTICO INICIAL' as etapa;

-- Usuários com registros duplicados
SELECT 
    user_id,
    COUNT(*) as total_records,
    COUNT(CASE WHEN billing_street IS NOT NULL THEN 1 END) as with_billing,
    COUNT(CASE WHEN billing_street IS NULL THEN 1 END) as without_billing
FROM user_settings
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Total de registros atuais
SELECT COUNT(*) as total_user_settings FROM user_settings;
SELECT COUNT(*) as total_user_profiles FROM user_profiles;

-- ==============================================
-- PARTE 2: CRIAR user_settings PARA USUÁRIOS SEM
-- ==============================================

SELECT 'CRIANDO user_settings PARA USUÁRIOS SEM' as etapa;

-- Criar user_settings para usuários que não têm
INSERT INTO user_settings (
    user_id,
    full_name,
    phone,
    company,
    document,
    avatar_url,
    email_notifications,
    push_notifications,
    sms_notifications,
    two_factor_enabled,
    login_alerts,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at
)
SELECT 
    UPPER(up.firebase_uid) as user_id,
    up.full_name,
    up.phone,
    up.company_name as company,
    up.document,
    up.avatar_url,
    true as email_notifications,
    false as push_notifications,
    true as sms_notifications,
    false as two_factor_enabled,
    true as login_alerts,
    NULL as billing_street,
    NULL as billing_city,
    NULL as billing_state,
    NULL as billing_zip_code,
    'Brasil' as billing_country,
    NOW() as created_at,
    NOW() as updated_at
FROM user_profiles up
LEFT JOIN user_settings us ON UPPER(up.firebase_uid) = us.user_id
WHERE us.user_id IS NULL
AND up.firebase_uid IS NOT NULL;

-- ==============================================
-- PARTE 3: LIMPAR DUPLICADOS
-- ==============================================

SELECT 'LIMPANDO DUPLICADOS' as etapa;

-- Deletar registros duplicados (manter apenas o melhor de cada usuário)
WITH ranked_records AS (
    SELECT 
        ctid,
        user_id,
        billing_street,
        created_at,
        updated_at,
        ROW_NUMBER() OVER (
            PARTITION BY user_id 
            ORDER BY 
                CASE WHEN billing_street IS NOT NULL THEN 0 ELSE 1 END,
                updated_at DESC
        ) as rn
    FROM user_settings
)
DELETE FROM user_settings 
WHERE ctid IN (
    SELECT ctid 
    FROM ranked_records 
    WHERE rn > 1
);

-- ==============================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- ==============================================

SELECT 'VERIFICAÇÃO FINAL' as etapa;

-- Verificar se ainda há duplicados
SELECT 
    user_id,
    COUNT(*) as total_records
FROM user_settings
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Verificar todos os registros finais
SELECT 
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at
FROM user_settings
ORDER BY user_id, created_at DESC;

-- Contadores finais
SELECT COUNT(*) as total_user_settings_final FROM user_settings;
SELECT COUNT(*) as total_user_profiles_final FROM user_profiles;

-- Verificar se todos os usuários têm user_settings
SELECT 
    COUNT(*) as usuarios_sem_user_settings
FROM user_profiles up
LEFT JOIN user_settings us ON UPPER(up.firebase_uid) = us.user_id
WHERE us.user_id IS NULL AND up.firebase_uid IS NOT NULL;

SELECT 'SCRIPT CONCLUÍDO' as status;





















