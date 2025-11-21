-- Script para testar inserção de cartão
-- Execute este script no Supabase SQL Editor

-- Teste de inserção com o ID do usuário atual
INSERT INTO user_payment_cards (
    user_id,
    last_four,
    brand,
    expiry_month,
    expiry_year,
    holder_name,
    is_default,
    created_at
) VALUES (
    'YNTB2V3606WPxV0zlZxLQNV1tCm1',
    '1234',
    'visa',
    12,
    2025,
    'Teste Usuario',
    true,
    NOW()
) RETURNING *;

























