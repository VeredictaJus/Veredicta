-- Corrigir registros duplicados e case sensitivity na tabela user_settings

-- 1. Primeiro, vamos ver os dados atuais
SELECT 
    user_id,
    LENGTH(user_id) as id_length,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at
FROM user_settings 
ORDER BY created_at DESC;

-- 2. Atualizar o registro com ID maiúsculo para ter os dados de billing
UPDATE user_settings 
SET 
    billing_street = 'Rua Conrado Pochapski, 216',
    billing_city = 'Campo Mourão',
    billing_state = 'PR',
    billing_zip_code = '87308-280',
    billing_country = 'Brasil',
    updated_at = NOW()
WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 3. Deletar o registro duplicado (com ID minúsculo)
DELETE FROM user_settings 
WHERE user_id = 'yNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 4. Verificar o resultado final
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
WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 5. Verificar se não há mais duplicatas
SELECT COUNT(*) as total_records FROM user_settings;





















