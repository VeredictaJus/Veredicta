-- Script final para corrigir políticas RLS da tabela user_payment_cards
-- Baseado na estrutura real da tabela
-- Execute este script no Supabase SQL Editor

-- 1. Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own payment cards" ON user_payment_cards;
DROP POLICY IF EXISTS "Users can insert their own payment cards" ON user_payment_cards;
DROP POLICY IF EXISTS "Users can update their own payment cards" ON user_payment_cards;
DROP POLICY IF EXISTS "Users can delete their own payment cards" ON user_payment_cards;

-- 2. Criar políticas corretas baseadas na estrutura real
-- Política para SELECT (visualizar)
CREATE POLICY "Users can view their own payment cards" ON user_payment_cards
    FOR SELECT 
    USING (auth.uid()::text = user_id);

-- Política para INSERT (adicionar)
CREATE POLICY "Users can insert their own payment cards" ON user_payment_cards
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

-- Política para UPDATE (atualizar)
CREATE POLICY "Users can update their own payment cards" ON user_payment_cards
    FOR UPDATE 
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Política para DELETE (deletar)
CREATE POLICY "Users can delete their own payment cards" ON user_payment_cards
    FOR DELETE 
    USING (auth.uid()::text = user_id);

-- 3. Verificar se as políticas foram criadas
SELECT 
    policyname, 
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_payment_cards'
ORDER BY policyname;

-- 4. Teste de inserção (comentado - descomente para testar)
/*
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
    'Teste Usuario',
    true
) RETURNING id, user_id, last_four, brand, holder_name;
*/

























