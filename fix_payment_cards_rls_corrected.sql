-- Script corrigido para políticas RLS da tabela user_payment_cards
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'user_payment_cards';

-- 2. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_payment_cards';

-- 3. Remover todas as políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own payment cards" ON user_payment_cards;
DROP POLICY IF EXISTS "Users can insert their own payment cards" ON user_payment_cards;
DROP POLICY IF EXISTS "Users can update their own payment cards" ON user_payment_cards;
DROP POLICY IF EXISTS "Users can delete their own payment cards" ON user_payment_cards;

-- 4. Criar políticas RLS corretas
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

-- 5. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_payment_cards';

-- 6. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_payment_cards'
ORDER BY ordinal_position;

























