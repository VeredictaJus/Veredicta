-- Debug script to find the exact source of UUID error
-- Run this in Supabase SQL Editor

-- 1. Check if there are multiple tables with firebase_uid columns
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE column_name LIKE '%firebase%' OR column_name LIKE '%uid%'
ORDER BY table_name, column_name;

-- 2. Check if there's a 'profiles' table (without _v2) that might be causing issues
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Check if there are any foreign key constraints pointing to UUID columns
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (kcu.column_name LIKE '%firebase%' OR kcu.column_name LIKE '%uid%');

-- 4. Check if there are any views that might be causing issues
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%profile%' 
  AND table_schema = 'public';

-- 5. Test the exact query that's failing
-- This will show us exactly what's happening
SELECT 
    'profiles_v2' as table_name,
    'firebase_uid' as column_name,
    'text' as data_type
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles_v2' 
    AND column_name = 'firebase_uid' 
    AND data_type = 'text'
);

-- 6. Check if there are any RLS policies that might be interfering
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
WHERE tablename LIKE '%profile%';
