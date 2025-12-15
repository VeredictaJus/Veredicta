-- Verificar se os dados de billing estão salvos na tabela user_settings
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
WHERE user_id = 'yNTB2V3606WPxVOzLZxLQNV1tCm1';

-- Verificar se existe algum registro na tabela
SELECT COUNT(*) as total_records FROM user_settings;

-- Verificar todos os registros da tabela
SELECT * FROM user_settings ORDER BY created_at DESC;





















