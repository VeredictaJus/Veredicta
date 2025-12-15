-- Check the app_2d8133c678_profiles table structure
-- This table might be causing the UUID error

-- 1. Check if the table exists and its structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'app_2d8133c678_profiles' 
ORDER BY ordinal_position;

-- 2. If the table exists, check if firebase_uid column is UUID type
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'app_2d8133c678_profiles' 
  AND column_name LIKE '%firebase%' OR column_name LIKE '%uid%';

-- 3. If firebase_uid is UUID type, alter it to TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_2d8133c678_profiles' 
    AND column_name = 'firebase_uid' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE app_2d8133c678_profiles ALTER COLUMN firebase_uid TYPE TEXT;
    RAISE NOTICE 'Column firebase_uid altered to TEXT in app_2d8133c678_profiles';
  ELSE
    RAISE NOTICE 'Column firebase_uid is already TEXT or does not exist in app_2d8133c678_profiles';
  END IF;
END $$;
