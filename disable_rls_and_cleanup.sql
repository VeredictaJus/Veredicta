-- Script para desabilitar RLS temporariamente e limpar duplicados

-- 1. Verificar políticas RLS atuais
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

-- 2. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_settings';

-- 3. Desabilitar RLS temporariamente
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- 4. Agora deletar o registro antigo (sem billing)
DELETE FROM user_settings 
WHERE user_id = 'yNTB2V3606WPxV0zlZxLQNV1tCm1' 
AND billing_street IS NULL
AND created_at = '2025-10-13 22:10:09.264391+00';

-- 5. Verificar se funcionou
SELECT 
    user_id,
    billing_street,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    created_at,
    updated_at
FROM user_settings
ORDER BY created_at DESC;

-- 6. Contar registros
SELECT COUNT(*) as total_records FROM user_settings;

-- 7. Reabilitar RLS (opcional - só se quiser manter RLS)
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;





















