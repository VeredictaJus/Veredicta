-- Script para corrigir definitivamente a função RPC
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos dropar a função atual
DROP FUNCTION IF EXISTS create_or_update_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 2. Criar a função corrigida com logs e validação
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
    -- VALIDAÇÃO CRÍTICA: Garantir que o role seja válido
    IF p_role NOT IN ('client', 'writer', 'admin') THEN
        RAISE EXCEPTION 'Role inválido: %. Deve ser client, writer ou admin', p_role;
    END IF;
    
    -- LOG: Mostrar parâmetros recebidos
    RAISE NOTICE 'RPC create_or_update_user_profile: p_role=%, p_email=%', p_role, p_email;
    
    -- Definir status baseado no role - CORREÇÃO CRÍTICA
    IF p_role = 'writer' THEN
        v_status := 'pending_approval';
        RAISE NOTICE 'Role é writer, status definido como: %', v_status;
    ELSE
        v_status := 'approved';
        RAISE NOTICE 'Role é %, status definido como: %', p_role, v_status;
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
        p_role,  -- CORREÇÃO: Garantir que o role seja salvo exatamente como recebido
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
        role = EXCLUDED.role,  -- CORREÇÃO: Sempre atualizar o role
        full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
        company_name = COALESCE(EXCLUDED.company_name, user_profiles.company_name),
        cnpj = COALESCE(EXCLUDED.cnpj, user_profiles.cnpj),
        phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
        address = COALESCE(EXCLUDED.address, user_profiles.address),
        status = EXCLUDED.status,  -- CORREÇÃO: Sempre atualizar o status
        updated_at = NOW()
    RETURNING * INTO v_result;

    -- VALIDAÇÃO FINAL: Verificar se foi salvo corretamente
    IF v_result.role != p_role THEN
        RAISE EXCEPTION 'ERRO CRÍTICO: Role não foi salvo corretamente! Esperado: %, Salvo: %', p_role, v_result.role;
    END IF;
    
    IF v_result.status != v_status THEN
        RAISE EXCEPTION 'ERRO CRÍTICO: Status não foi salvo corretamente! Esperado: %, Salvo: %', v_status, v_result.status;
    END IF;

    RAISE NOTICE 'SUCESSO: Perfil criado/atualizado - role: %, status: %', v_result.role, v_result.status;

    RETURN v_result;
END;
$$;

-- 3. Testar a função corrigida
SELECT create_or_update_user_profile(
  'test-corrected-writer-456',
  'corrected-writer@teste.com',
  'writer',
  'Maria Corrigida',
  NULL,
  NULL,
  '11999999999',
  'Rua Corrigida, 123'
);

-- 4. Verificar o resultado
SELECT firebase_uid, email, role, status, full_name
FROM user_profiles 
WHERE firebase_uid = 'test-corrected-writer-456';

-- 5. Limpar o teste
DELETE FROM user_profiles WHERE firebase_uid = 'test-corrected-writer-456';















