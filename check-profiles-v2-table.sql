-- Check and fix profiles_v2 table structure
-- Run this in Supabase SQL Editor

-- First, check if profiles_v2 table exists and its structure
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles_v2' 
ORDER BY ordinal_position;

-- If the table doesn't exist, create it with the correct structure
CREATE TABLE IF NOT EXISTS profiles_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,  -- This should be TEXT, not UUID
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  company_name TEXT,
  cnpj TEXT,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_v2_firebase_uid ON profiles_v2(firebase_uid);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles_v2 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON profiles_v2;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_v2;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_v2;

-- Create policies for profiles_v2
CREATE POLICY "Users can read own profile" ON profiles_v2
  FOR SELECT USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can insert own profile" ON profiles_v2
  FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can update own profile" ON profiles_v2
  FOR UPDATE USING (auth.uid()::text = firebase_uid);

-- If the firebase_uid column is UUID type, alter it to TEXT
-- (This might fail if there's data, so check first)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles_v2' 
    AND column_name = 'firebase_uid' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE profiles_v2 ALTER COLUMN firebase_uid TYPE TEXT;
  END IF;
END $$;
