-- Script para limpar duplicados de TODOS os usuários no sistema

-- 1. Verificar todos os usuários com registros duplicados
SELECT 
    user_id,
    COUNT(*) as total_records,
    COUNT(CASE WHEN billing_street IS NOT NULL THEN 1 END) as records_with_billing,
    COUNT(CASE WHEN billing_street IS NULL THEN 1 END) as records_without_billing,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM user_settings
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY total_records DESC;

-- 2. Verificar estrutura atual da tabela
SELECT 
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as row_num
FROM user_settings
ORDER BY user_id, updated_at DESC;

-- 3. Criar tabela temporária com registros únicos (manter o mais recente com dados)
WITH ranked_records AS (
    SELECT 
        *,
        ROW_NUMBER() OVER (
            PARTITION BY user_id 
            ORDER BY 
                CASE WHEN billing_street IS NOT NULL THEN 0 ELSE 1 END,
                updated_at DESC
        ) as rn
    FROM user_settings
),
records_to_keep AS (
    SELECT * FROM ranked_records WHERE rn = 1
)
SELECT 
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at,
    'KEEP' as action
FROM records_to_keep
ORDER BY user_id;

-- 4. Deletar registros duplicados (manter apenas o melhor registro de cada usuário)
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

-- 5. Verificar resultado final
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

-- 6. Contar registros finais por usuário
SELECT 
    user_id,
    COUNT(*) as total_records
FROM user_settings
GROUP BY user_id
ORDER BY user_id;

-- 7. Contar total de registros
SELECT COUNT(*) as total_records FROM user_settings;





















