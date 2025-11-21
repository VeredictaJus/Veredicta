-- Script para limpar registros duplicados e manter apenas o com billing correto

-- 1. Verificar registros duplicados
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

-- 2. Deletar o registro antigo (sem billing) e manter o novo (com billing)
DELETE FROM user_settings 
WHERE user_id = 'yNTB2V3606WPxV0zlZxLQNV1tCm1' 
AND billing_street IS NULL
AND created_at = '2025-10-13 22:10:09.264391+00';

-- 3. Verificar se ficou apenas 1 registro
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
ORDER BY created_at DESC;

-- 4. Contar registros finais
SELECT COUNT(*) as total_records FROM user_settings;





















