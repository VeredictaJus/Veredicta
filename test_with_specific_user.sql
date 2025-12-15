-- Script para testar com ID específico do usuário
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuário atual no SQL Editor
SELECT 
    current_user as sql_editor_user,
    auth.uid() as auth_uid,
    'YNTB2V3606WPxV0zlZxLQNV1tCm1' as target_user_id;

-- 2. Testar inserção com ID específico (como admin)
INSERT INTO user_payment_cards (
    user_id,
    last_four,
    brand,
    expiry_month,
    expiry_year,
    holder_name,
    is_default
) VALUES (
    'YNTB2V3606WPxV0zlZxLQNV1tCm1',
    '1234',
    'visa',
    12,
    2025,
    'Teste Admin Insert',
    true
) RETURNING *;

-- 3. Verificar se foi inserido
SELECT * FROM user_payment_cards WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 4. Limpar dados de teste (opcional)
-- DELETE FROM user_payment_cards WHERE holder_name = 'Teste Admin Insert';

























