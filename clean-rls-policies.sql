-- Clean and recreate RLS policies for profiles_v2
-- This will remove ALL existing policies and create only the correct ones

-- 1. First, let's see all current policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles_v2'
ORDER BY policyname;

-- 2. Drop ALL existing policies for profiles_v2
DROP POLICY IF EXISTS "Users can read own profile" ON profiles_v2;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_v2;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_v2;
DROP POLICY IF EXISTS "profiles_v2_insert_own" ON profiles_v2;
DROP POLICY IF EXISTS "profiles_v2_select_own" ON profiles_v2;
DROP POLICY IF EXISTS "profiles_v2_update_own" ON profiles_v2;
DROP POLICY IF EXISTS "Service role can access all profiles" ON profiles_v2;

-- 3. Create ONLY the correct policies that work with Firebase UIDs
-- These policies will work with the bridge service that converts Firebase UID to Supabase JWT

-- Policy for reading own profile
CREATE POLICY "firebase_read_own_profile" ON profiles_v2
  FOR SELECT USING (
    auth.jwt() ->> 'sub' = firebase_uid
  );

-- Policy for inserting own profile
CREATE POLICY "firebase_insert_own_profile" ON profiles_v2
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'sub' = firebase_uid
  );

-- Policy for updating own profile
CREATE POLICY "firebase_update_own_profile" ON profiles_v2
  FOR UPDATE USING (
    auth.jwt() ->> 'sub' = firebase_uid
  );

-- Policy for service role (admin operations)
CREATE POLICY "service_role_all_access" ON profiles_v2
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- 4. Verify the new policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles_v2'
ORDER BY policyname;
