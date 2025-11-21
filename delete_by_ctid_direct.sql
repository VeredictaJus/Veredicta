-- Script para deletar usando ctid específico

-- 1. Verificar registros atuais com ctid
SELECT 
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at,
    ctid
FROM user_settings
ORDER BY created_at DESC;

-- 2. Deletar usando ctid específico do registro antigo (sem billing)
-- Baseado nos resultados anteriores: ctid = (0,22)
DELETE FROM user_settings WHERE ctid = '(0,22)';

-- 3. Verificar se funcionou
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

-- 4. Contar registros
SELECT COUNT(*) as total_records FROM user_settings;





















