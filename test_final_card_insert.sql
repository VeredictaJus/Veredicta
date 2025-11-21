-- Script final para testar inserção de cartão
-- Execute este script no Supabase SQL Editor após executar final_fix_payment_cards.sql

-- Teste de inserção com dados reais
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
    'Natalia Yamao',
    true
) RETURNING id, user_id, last_four, brand, holder_name, is_default, created_at;

-- Verificar se foi inserido
SELECT * FROM user_payment_cards WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

























