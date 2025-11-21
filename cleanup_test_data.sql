-- Script para limpar dados de teste
-- Execute este script no Supabase SQL Editor

-- Remover cartões de teste
DELETE FROM user_payment_cards 
WHERE holder_name IN ('Teste Admin Insert', 'Teste Bypass RLS', 'Teste Debug');

-- Verificar se foram removidos
SELECT * FROM user_payment_cards WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

























