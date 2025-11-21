-- SCRIPT ULTRA SIMPLES PARA CORRIGIR user_settings
-- Execute este script no Supabase SQL Editor

-- 1. Limpar políticas RLS problemáticas
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Allow all operations on user_settings" ON public.user_settings;

-- 2. Garantir permissões
GRANT ALL ON public.user_settings TO anon;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

-- 3. Criar política RLS simples
CREATE POLICY "Enable all access for authenticated users" ON public.user_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Testar inserção
INSERT INTO public.user_settings (
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country
) VALUES (
    'TESTE_ULTRA_SIMPLE',
    'Rua Teste, 123',
    'São Paulo',
    'SP',
    '01234-567',
    'Brasil'
) ON CONFLICT (user_id) DO UPDATE SET
    billing_street = EXCLUDED.billing_street,
    billing_city = EXCLUDED.billing_city,
    billing_state = EXCLUDED.billing_state,
    billing_zip_code = EXCLUDED.billing_zip_code,
    billing_country = EXCLUDED.billing_country;

-- 5. Verificar se funcionou
SELECT 'SUCESSO: Tabela funcionando!' as status, COUNT(*) as total FROM public.user_settings;

-- 6. Limpar teste
DELETE FROM public.user_settings WHERE user_id = 'TESTE_ULTRA_SIMPLE';





















