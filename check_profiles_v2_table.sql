-- Verificar se a tabela profiles_v2 existe e tem dados
-- Este script verifica a estrutura da tabela e os dados disponíveis

-- 1. Verificar se a tabela profiles_v2 existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles_v2', 'user_profiles', 'profiles');

-- 2. Verificar estrutura da tabela profiles_v2 (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles_v2'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar dados na tabela profiles_v2
SELECT 
    firebase_uid,
    email,
    role,
    created_at
FROM public.profiles_v2
LIMIT 5;

-- 4. Verificar se há participantes na conversation_participants
SELECT 
    cp.id,
    cp.conversation_id,
    cp.user_id,
    cp.role,
    p.firebase_uid,
    p.email
FROM public.conversation_participants cp
LEFT JOIN public.profiles_v2 p ON cp.user_id = p.firebase_uid
LIMIT 5;

-- 5. Verificar foreign keys relacionadas
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'conversation_participants';


























