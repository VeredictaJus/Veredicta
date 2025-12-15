-- Script para temporariamente desabilitar RLS na tabela user_payment_cards
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE user_payment_cards DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_payment_cards';

-- 3. Testar inserção direta
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
    '1111',
    'visa',
    12,
    2025,
    'Teste RLS Desabilitado',
    true
) RETURNING *;

-- 4. Verificar inserção
SELECT * FROM user_payment_cards WHERE holder_name = 'Teste RLS Desabilitado';

























