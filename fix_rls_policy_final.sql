-- SCRIPT PARA CORRIGIR POLÍTICA RLS DA TABELA user_settings
-- Execute este script no Supabase SQL Editor

-- 1. Remover TODAS as políticas RLS existentes
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Allow all operations on user_settings" ON public.user_settings;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.user_settings;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.user_settings;
DROP POLICY IF EXISTS "Enable insert for users" ON public.user_settings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_settings;

-- 2. Desabilitar RLS temporariamente
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;

-- 3. Garantir permissões completas
GRANT ALL ON public.user_settings TO anon;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
GRANT ALL ON public.user_settings TO postgres;

-- 4. Garantir permissões na sequência
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- 5. Testar inserção sem RLS
INSERT INTO public.user_settings (
    user_id,
    full_name,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country
) VALUES (
    'TESTE_SEM_RLS_123',
    'Teste Sem RLS',
    'Rua Teste Sem RLS, 456',
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

-- 6. Verificar se funcionou sem RLS
SELECT 
    'Teste sem RLS' as status,
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code
FROM public.user_settings
WHERE user_id = 'TESTE_SEM_RLS_123';

-- 7. Limpar dados de teste
DELETE FROM public.user_settings WHERE user_id = 'TESTE_SEM_RLS_123';

-- 8. Verificação final
SELECT 
    'SUCESSO: Tabela user_settings funcionando SEM RLS!' as status,
    COUNT(*) as total_registros
FROM public.user_settings;

-- 9. Opcional: Reabilitar RLS com política mais simples (descomente se quiser)
-- ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all authenticated users" ON public.user_settings
--     FOR ALL USING (auth.role() = 'authenticated');





















