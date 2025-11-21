-- Script final para corrigir completamente a tabela user_settings

-- 1. Verificar os registros atuais
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

-- 2. Atualizar o registro com ID maiúsculo com dados de billing
UPDATE user_settings 
SET 
    billing_street = 'Rua Conrado Pochapski, 216',
    billing_city = 'Campo Mourão',
    billing_state = 'PR',
    billing_zip_code = '87308-280',
    billing_country = 'Brasil',
    updated_at = NOW()
WHERE user_id = 'YNTB2V3606WPxV0z1ZxLQNV1tCm1';

-- 3. Deletar TODOS os registros com ID minúsculo
DELETE FROM user_settings 
WHERE user_id = 'yNTB2V3606WPxV0z1ZxLQNV1tCm1';

-- 4. Verificar se ainda há duplicatas
SELECT COUNT(*) as total_records FROM user_settings;

-- 5. Verificar o registro final
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

-- 6. Se ainda houver 2 registros, vamos deletar o mais antigo
WITH ranked_records AS (
    SELECT 
        user_id,
        created_at,
        ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
    FROM user_settings
)
DELETE FROM user_settings 
WHERE user_id IN (
    SELECT user_id 
    FROM ranked_records 
    WHERE rn > 1
);

-- 7. Verificação final
SELECT 
    'Registros finais:' as status,
    COUNT(*) as total_records 
FROM user_settings;

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





















