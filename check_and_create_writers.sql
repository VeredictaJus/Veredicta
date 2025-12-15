-- Script para verificar e criar redatores de teste

-- 1. Verificar se existem redatores na tabela user_profiles
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'writer' THEN 1 END) as total_writers,
    COUNT(CASE WHEN role = 'writer' AND is_active = true THEN 1 END) as active_writers
FROM user_profiles;

-- 2. Listar todos os redatores existentes
SELECT 
    id,
    firebase_uid,
    full_name,
    email,
    role,
    is_active,
    created_at
FROM user_profiles 
WHERE role = 'writer'
ORDER BY created_at DESC;

-- 3. Criar redatores de teste se não existirem
DO $$
BEGIN
    -- Verificar se já existem redatores
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'writer') THEN
        -- Criar redatores de teste
        INSERT INTO user_profiles (id, firebase_uid, email, role, full_name, is_active, created_at, updated_at)
        VALUES 
            (gen_random_uuid(), 'writer-joao-silva', 'joao.silva@veredictajus.com', 'writer', 'João Silva', true, NOW(), NOW()),
            (gen_random_uuid(), 'writer-maria-santos', 'maria.santos@veredictajus.com', 'writer', 'Maria Santos', true, NOW(), NOW()),
            (gen_random_uuid(), 'writer-pedro-costa', 'pedro.costa@veredictajus.com', 'writer', 'Pedro Costa', true, NOW(), NOW()),
            (gen_random_uuid(), 'writer-ana-oliveira', 'ana.oliveira@veredictajus.com', 'writer', 'Ana Oliveira', true, NOW(), NOW()),
            (gen_random_uuid(), 'writer-carlos-rodrigues', 'carlos.rodrigues@veredictajus.com', 'writer', 'Carlos Rodrigues', true, NOW(), NOW());
        
        RAISE NOTICE 'Redatores de teste criados com sucesso!';
    ELSE
        RAISE NOTICE 'Redatores já existem na tabela.';
    END IF;
END $$;

-- 4. Verificar redatores criados
SELECT 
    firebase_uid,
    full_name,
    email,
    role,
    is_active
FROM user_profiles 
WHERE role = 'writer'
ORDER BY full_name;

-- 5. Verificar estrutura da tabela user_profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
