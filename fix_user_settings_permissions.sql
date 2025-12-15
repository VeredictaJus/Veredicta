-- SCRIPT PARA CORRIGIR PERMISSÕES DA TABELA user_settings
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe e suas permissões
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'user_settings' AND schemaname = 'public';

-- 2. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_settings';

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_settings' AND schemaname = 'public';

-- 4. Garantir que a tabela está no schema público
ALTER TABLE IF EXISTS public.user_settings SET SCHEMA public;

-- 5. Garantir permissões corretas para o usuário anônimo e autenticado
GRANT ALL ON public.user_settings TO anon;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

-- 6. Garantir permissões na sequência (se existir)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 7. Recriar políticas RLS mais simples e robustas
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;

-- Política para SELECT (visualizar)
CREATE POLICY "Enable read access for users based on user_id" ON public.user_settings
    FOR SELECT USING (true);

-- Política para INSERT (inserir)
CREATE POLICY "Enable insert for users" ON public.user_settings
    FOR INSERT WITH CHECK (true);

-- Política para UPDATE (atualizar)
CREATE POLICY "Enable update for users based on user_id" ON public.user_settings
    FOR UPDATE USING (true);

-- 8. Verificar se as políticas foram criadas
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'user_settings';

-- 9. Testar inserção de dados
INSERT INTO public.user_settings (
    user_id,
    full_name,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country
) VALUES (
    'TESTE_PERMISSOES_123',
    'Teste Permissões',
    'Rua Teste Permissões, 456',
    'São Paulo',
    'SP',
    '01234-567',
    'Brasil'
) ON CONFLICT (user_id) DO UPDATE SET
    billing_street = EXCLUDED.billing_street,
    billing_city = EXCLUDED.billing_city,
    billing_state = EXCLUDED.billing_state,
    billing_zip_code = EXCLUDED.billing_zip_code,
    billing_country = EXCLUDED.billing_country,
    updated_at = NOW();

-- 10. Verificar se a inserção funcionou
SELECT 
    'Teste de permissões' as status,
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code
FROM public.user_settings
WHERE user_id = 'TESTE_PERMISSOES_123';

-- 11. Limpar dados de teste
DELETE FROM public.user_settings WHERE user_id = 'TESTE_PERMISSOES_123';

-- 12. Verificação final
SELECT 
    'Verificação final' as status,
    COUNT(*) as total_registros,
    'Tabela user_settings funcionando!' as mensagem
FROM public.user_settings;
