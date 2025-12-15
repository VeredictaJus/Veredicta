-- Script final para atualizar os dados de billing no registro existente

-- 1. Verificar o registro atual
SELECT 
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at
FROM user_settings;

-- 2. Atualizar os dados de billing no registro existente (ID minúsculo)
UPDATE user_settings 
SET 
    billing_street = 'Rua Conrado Pochapski, 216',
    billing_city = 'Campo Mourão',
    billing_state = 'PR',
    billing_zip_code = '87308-280',
    billing_country = 'Brasil',
    updated_at = NOW()
WHERE user_id = 'yNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 3. Verificar se foi atualizado
SELECT 
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at
FROM user_settings;

-- 4. Contar registros
SELECT COUNT(*) as total_records FROM user_settings;
