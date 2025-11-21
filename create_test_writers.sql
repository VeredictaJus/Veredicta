-- Script simples para criar redatores de teste

-- 1. Verificar redatores existentes
SELECT 
    COUNT(*) as total_writers,
    firebase_uid,
    full_name,
    email,
    role,
    is_active
FROM user_profiles 
WHERE role = 'writer'
GROUP BY firebase_uid, full_name, email, role, is_active;

-- 2. Criar redatores de teste
INSERT INTO user_profiles (firebase_uid, email, role, full_name, is_active)
VALUES 
    ('writer-joao-silva', 'joao.silva@veredictajus.com', 'writer', 'João Silva', true),
    ('writer-maria-santos', 'maria.santos@veredictajus.com', 'writer', 'Maria Santos', true),
    ('writer-pedro-costa', 'pedro.costa@veredictajus.com', 'writer', 'Pedro Costa', true),
    ('writer-ana-oliveira', 'ana.oliveira@veredictajus.com', 'writer', 'Ana Oliveira', true),
    ('writer-carlos-rodrigues', 'carlos.rodrigues@veredictajus.com', 'writer', 'Carlos Rodrigues', true)
ON CONFLICT (firebase_uid) DO NOTHING;

-- 3. Verificar redatores criados
SELECT 
    firebase_uid,
    full_name,
    email,
    role,
    is_active
FROM user_profiles 
WHERE role = 'writer'
ORDER BY full_name;
