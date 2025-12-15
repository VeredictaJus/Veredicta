-- Script para descobrir o nome correto da tabela de planos
-- Vamos encontrar onde estão armazenados os planos dos usuários

-- 1. Listar todas as tabelas que podem conter informações de planos
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%plan%'
ORDER BY table_name;

-- 2. Listar todas as tabelas que podem conter informações de usuários
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%user%' OR table_name LIKE '%client%')
ORDER BY table_name;

-- 3. Verificar se existe alguma tabela com informações de planos
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name LIKE '%plan%'
ORDER BY table_name, column_name;

-- 4. Verificar se existe alguma tabela com informações de billing
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name LIKE '%billing%' OR column_name LIKE '%subscription%')
ORDER BY table_name, column_name;
















