-- Script para diagnosticar e corrigir o problema de billing

-- 1. Verificar todos os registros na tabela
SELECT 
    user_id,
    LENGTH(user_id) as user_id_length,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at
FROM user_settings
ORDER BY created_at DESC;

-- 2. Verificar se existe algum problema com caracteres invisíveis
SELECT 
    user_id,
    ASCII(SUBSTRING(user_id, 1, 1)) as first_char_ascii,
    ASCII(SUBSTRING(user_id, 2, 1)) as second_char_ascii,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country
FROM user_settings;

-- 3. Tentar UPDATE usando LIKE para capturar variações
UPDATE user_settings 
SET 
    billing_street = 'Rua Conrado Pochapski, 216',
    billing_city = 'Campo Mourão',
    billing_state = 'PR',
    billing_zip_code = '87308-280',
    billing_country = 'Brasil',
    updated_at = NOW()
WHERE user_id LIKE '%NTB2V3606WPxV0zlZxLQNV1tCm1%';

-- 4. Se o UPDATE acima não funcionar, tentar com INSERT OR UPDATE
INSERT INTO user_settings (
    user_id,
    full_name,
    phone,
    company,
    document,
    avatar_url,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at
) VALUES (
    'yNTB2V3606WPxV0zlZxLQNV1tCm1',
    'Usuário Teste',
    '',
    '',
    '',
    '',
    'Rua Conrado Pochapski, 216',
    'Campo Mourão',
    'PR',
    '87308-280',
    'Brasil',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    billing_street = EXCLUDED.billing_street,
    billing_city = EXCLUDED.billing_city,
    billing_state = EXCLUDED.billing_state,
    billing_zip_code = EXCLUDED.billing_zip_code,
    billing_country = EXCLUDED.billing_country,
    updated_at = EXCLUDED.updated_at;

-- 5. Verificar se foi atualizado
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

-- 6. Contar registros
SELECT COUNT(*) as total_records FROM user_settings;





















