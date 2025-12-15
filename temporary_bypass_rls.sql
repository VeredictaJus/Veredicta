-- Script temporário para permitir inserção de cartões
-- Execute este script no Supabase SQL Editor

-- 1. Criar política temporária que permite inserção com user_id válido
DROP POLICY IF EXISTS "Allow insert with valid user_id" ON user_payment_cards;

CREATE POLICY "Allow insert with valid user_id" ON user_payment_cards
    FOR INSERT 
    WITH CHECK (
        user_id IS NOT NULL 
        AND user_id != '' 
        AND length(user_id) > 10
    );

-- 2. Verificar políticas atuais
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_payment_cards'
ORDER BY policyname;

-- 3. Testar inserção
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
    '9999',
    'visa',
    12,
    2025,
    'Teste Política Temporária',
    true
) RETURNING *;

























