-- Script para corrigir RLS para funcionar com Firebase Auth
-- Execute este script no Supabase SQL Editor

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Users can insert their own payment cards" ON user_payment_cards;
DROP POLICY IF EXISTS "Allow insert with valid user_id" ON user_payment_cards;

-- 2. Criar nova política que permite inserção com user_id válido
CREATE POLICY "Allow insert with valid user_id" ON user_payment_cards
    FOR INSERT 
    WITH CHECK (
        user_id IS NOT NULL 
        AND user_id != '' 
        AND length(user_id) > 10
        AND user_id ~ '^[A-Za-z0-9_-]+$'  -- Valida formato do Firebase UID
    );

-- 3. Verificar políticas
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_payment_cards'
ORDER BY policyname;

























