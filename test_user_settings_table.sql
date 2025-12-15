-- Testar se a tabela user_settings foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Testar inserção de dados de exemplo
INSERT INTO user_settings (
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country
) VALUES (
    'yNTB2V3606WPxVOzLZxLQNV1tCm1',
    'Rua Conrado Pochapski, 216',
    'Campo Mourão',
    'PR',
    '87308-280',
    'Brasil'
) ON CONFLICT (user_id) 
DO UPDATE SET 
    billing_street = EXCLUDED.billing_street,
    billing_city = EXCLUDED.billing_city,
    billing_state = EXCLUDED.billing_state,
    billing_zip_code = EXCLUDED.billing_zip_code,
    billing_country = EXCLUDED.billing_country,
    updated_at = NOW();

-- Verificar se os dados foram inseridos
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





















