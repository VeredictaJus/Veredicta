-- Script para testar inserção de cartão de pagamento
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_payment_cards'
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_payment_cards';

-- 3. Testar inserção com dados de exemplo
-- (Substitua 'YNTB2V3606WPxV0zlZxLQNV1tCm1' pelo ID do usuário atual)
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

-- 4. Verificar se foi inserido
SELECT * FROM user_payment_cards WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

-- 5. Limpar dados de teste (se necessário)
-- DELETE FROM user_payment_cards WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1' AND holder_name = 'Teste Usuario';

























