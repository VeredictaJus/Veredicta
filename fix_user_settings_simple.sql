-- SCRIPT SIMPLES PARA CORRIGIR user_settings
-- Execute este script no Supabase SQL Editor

-- 1. Limpar todas as políticas RLS existentes
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Allow all operations on user_settings" ON public.user_settings;

-- 2. Garantir permissões básicas
GRANT ALL ON public.user_settings TO anon;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

-- 3. Criar políticas RLS simples e funcionais
CREATE POLICY "Enable all access for authenticated users" ON public.user_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Testar inserção de dados
INSERT INTO public.user_settings (
    user_id,
    full_name,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country
) VALUES (
    'TESTE_FINAL_123',
    'Teste Final',
    'Rua Teste Final, 789',
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

-- 5. Verificar se funcionou
SELECT 
    'Teste de inserção' as status,
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code
FROM public.user_settings
WHERE user_id = 'TESTE_FINAL_123';

-- 6. Limpar dados de teste
DELETE FROM public.user_settings WHERE user_id = 'TESTE_FINAL_123';

-- 7. Verificação final
SELECT 
    'SUCESSO: Tabela user_settings funcionando!' as status,
    COUNT(*) as total_registros
FROM public.user_settings;





















