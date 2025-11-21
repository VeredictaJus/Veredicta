-- Script mais direto para limpar duplicados

-- 1. Verificar registros atuais
SELECT 
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at,
    ctid -- Identificador físico da linha
FROM user_settings
ORDER BY created_at DESC;

-- 2. Deletar usando ctid (mais direto)
-- Primeiro, vamos deletar o registro mais antigo (sem billing)
DELETE FROM user_settings 
WHERE ctid IN (
    SELECT ctid 
    FROM user_settings 
    WHERE user_id = 'yNTB2V3606WPxV0zlZxLQNV1tCm1' 
    AND billing_street IS NULL
    ORDER BY created_at ASC
    LIMIT 1
);

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





















