-- Script para diagnosticar e corrigir completamente o problema RLS
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário está autenticado corretamente
SELECT auth.uid() as current_user_id;

-- 2. Verificar políticas atuais da tabela user_settings
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 3. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_settings';

-- 4. REMOVER TODAS AS POLÍTICAS (para limpar completamente)
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

-- 5. CRIAR POLÍTICAS MAIS PERMISSIVAS (temporariamente para teste)
CREATE POLICY "Allow all operations on user_settings" ON user_settings
    FOR ALL USING (true) WITH CHECK (true);

-- 6. Verificar se as novas políticas foram criadas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 7. Testar inserção direta
INSERT INTO user_settings (
    user_id, 
    email_notifications, 
    push_notifications,
    full_name,
    phone
) VALUES (
    'YNTB2V3606WPxV0zlZxLQNV1tCm1',
    true,
    false,
    'Teste Nome',
    '11999999999'
) ON CONFLICT (user_id) DO UPDATE SET
    email_notifications = EXCLUDED.email_notifications,
    push_notifications = EXCLUDED.push_notifications,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- 8. Verificar se funcionou
SELECT * FROM user_settings WHERE user_id = 'YNTB2V3606WPxV0zlZxLQNV1tCm1';

























