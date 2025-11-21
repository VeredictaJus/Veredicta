-- SCRIPT DE TESTE PARA VERIFICAR FUNCIONALIDADE DA TABELA user_settings
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe e tem dados
SELECT 
    'Verificação da tabela user_settings' as teste,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN billing_street IS NOT NULL THEN 1 END) as com_endereco,
    COUNT(CASE WHEN billing_street IS NULL THEN 1 END) as sem_endereco
FROM public.user_settings;

-- 2. Verificar todos os registros existentes
SELECT 
    user_id,
    full_name,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at
FROM public.user_settings
ORDER BY created_at DESC;

-- 3. Verificar políticas RLS ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_settings';

-- 4. Testar inserção de dados de teste (simular o que o app faz)
INSERT INTO public.user_settings (
    user_id,
    full_name,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country
) VALUES (
    'TESTE_USER_123',
    'Usuário Teste',
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
    billing_country = EXCLUDED.billing_country,
    updated_at = NOW();

-- 5. Verificar se o teste foi inserido/atualizado
SELECT 
    'Teste de inserção/atualização' as teste,
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code
FROM public.user_settings
WHERE user_id = 'TESTE_USER_123';

-- 6. Limpar dados de teste
DELETE FROM public.user_settings WHERE user_id = 'TESTE_USER_123';

-- 7. Verificar se foi removido
SELECT 
    'Limpeza do teste' as teste,
    COUNT(*) as registros_restantes
FROM public.user_settings
WHERE user_id = 'TESTE_USER_123';





















