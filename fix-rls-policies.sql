-- Fix RLS policies for profiles_v2 table
-- The issue is that auth.uid() returns a UUID but firebase_uid is TEXT

-- First, let's check current policies
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
WHERE tablename = 'profiles_v2';

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles_v2;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_v2;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_v2;

-- Create new policies that work with Firebase UIDs
-- These policies will work with the bridge service that converts Firebase UID to Supabase JWT

-- Policy for reading own profile
CREATE POLICY "Users can read own profile" ON profiles_v2
  FOR SELECT USING (
    auth.uid()::text = firebase_uid OR 
    auth.jwt() ->> 'sub' = firebase_uid
  );

-- Policy for inserting own profile
CREATE POLICY "Users can insert own profile" ON profiles_v2
  FOR INSERT WITH CHECK (
    auth.uid()::text = firebase_uid OR 
    auth.jwt() ->> 'sub' = firebase_uid
  );

-- Policy for updating own profile
CREATE POLICY "Users can update own profile" ON profiles_v2
  FOR UPDATE USING (
    auth.uid()::text = firebase_uid OR 
    auth.jwt() ->> 'sub' = firebase_uid
  );

-- Also create a policy that allows service role to access all profiles
-- (This might be needed for admin operations)
CREATE POLICY "Service role can access all profiles" ON profiles_v2
  FOR ALL USING (
    auth.role() = 'service_role'
  );
