-- Script simples para corrigir políticas RLS da tabela user_payment_cards
-- Execute este script no Supabase SQL Editor

-- 1. Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own payment cards" ON user_payment_cards;
DROP POLICY IF EXISTS "Users can insert their own payment cards" ON user_payment_cards;
DROP POLICY IF EXISTS "Users can update their own payment cards" ON user_payment_cards;
DROP POLICY IF EXISTS "Users can delete their own payment cards" ON user_payment_cards;

-- 2. Criar políticas corretas
CREATE POLICY "Users can view their own payment cards" ON user_payment_cards
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own payment cards" ON user_payment_cards
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own payment cards" ON user_payment_cards
    FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own payment cards" ON user_payment_cards
    FOR DELETE USING (auth.uid()::text = user_id);

-- 3. Verificar políticas criadas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_payment_cards';

























