-- Script para atualizar a função create_or_update_user_profile
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a função existe
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_or_update_user_profile';

-- 2. Atualizar a função para incluir status baseado no role
CREATE OR REPLACE FUNCTION create_or_update_user_profile(
    p_firebase_uid TEXT,
    p_email TEXT,
    p_role TEXT,
    p_full_name TEXT DEFAULT NULL,
    p_company_name TEXT DEFAULT NULL,
    p_cnpj TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL
)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status TEXT;
    v_result user_profiles;
BEGIN
    -- Definir status baseado no role
    IF p_role = 'writer' THEN
        v_status := 'pending_approval';
    ELSE
        v_status := 'approved';
    END IF;

    -- Inserir ou atualizar o perfil
    INSERT INTO user_profiles (
        firebase_uid,
        email,
        role,
        full_name,
        company_name,
        cnpj,
        phone,
        address,
        status,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        p_firebase_uid,
        p_email,
        p_role,
        p_full_name,
        p_company_name,
        p_cnpj,
        p_phone,
        p_address,
        v_status,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (firebase_uid)
    DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
        company_name = COALESCE(EXCLUDED.company_name, user_profiles.company_name),
        cnpj = COALESCE(EXCLUDED.cnpj, user_profiles.cnpj),
        phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
        address = COALESCE(EXCLUDED.address, user_profiles.address),
        status = COALESCE(EXCLUDED.status, user_profiles.status),
        updated_at = NOW()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;

-- 3. Verificar se a função foi atualizada
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_or_update_user_profile';

-- 4. Testar a função (opcional)
-- SELECT create_or_update_user_profile(
--     'test-uid-123',
--     'teste@exemplo.com',
--     'writer',
--     'João Teste',
--     NULL,
--     NULL,
--     '11999999999',
--     NULL
-- );















