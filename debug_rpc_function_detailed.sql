-- Script para investigar e corrigir a função RPC definitivamente
-- Execute este script no Supabase SQL Editor

-- 1. Verificar a função RPC atual
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_or_update_user_profile'
AND routine_schema = 'public';

-- 2. Verificar os parâmetros da função
SELECT 
  parameter_name,
  data_type,
  parameter_default
FROM information_schema.parameters 
WHERE specific_name = (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'create_or_update_user_profile'
  AND routine_schema = 'public'
);

-- 3. Testar a função com logs detalhados
-- Vamos criar uma versão temporária com logs
CREATE OR REPLACE FUNCTION create_or_update_user_profile_debug(
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
    -- LOG: Mostrar parâmetros recebidos
    RAISE NOTICE 'DEBUG: Parâmetros recebidos - p_role: %, p_email: %', p_role, p_email;
    
    -- Definir status baseado no role
    IF p_role = 'writer' THEN
        v_status := 'pending_approval';
        RAISE NOTICE 'DEBUG: Role é writer, status definido como: %', v_status;
    ELSE
        v_status := 'approved';
        RAISE NOTICE 'DEBUG: Role é %, status definido como: %', p_role, v_status;
    END IF;

    -- LOG: Mostrar valores antes da inserção
    RAISE NOTICE 'DEBUG: Inserindo com role: %, status: %', p_role, v_status;

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

    -- LOG: Mostrar resultado
    RAISE NOTICE 'DEBUG: Resultado - role: %, status: %', v_result.role, v_result.status;

    RETURN v_result;
END;
$$;

-- 4. Testar a função debug
SELECT create_or_update_user_profile_debug(
  'test-debug-writer-123',
  'debug-writer@teste.com',
  'writer',
  'João Debug',
  NULL,
  NULL,
  '11999999999',
  'Rua Debug, 123'
);

-- 5. Verificar o resultado
SELECT firebase_uid, email, role, status, full_name
FROM user_profiles 
WHERE firebase_uid = 'test-debug-writer-123';

-- 6. Limpar o teste
DELETE FROM user_profiles WHERE firebase_uid = 'test-debug-writer-123';















