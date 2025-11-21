-- Admin User Setup Utility
-- Run this script manually in Supabase SQL editor if needed

-- Step 1: Insert admin user into profiles table (if not using RLS that blocks it)
INSERT INTO app_2d8133c678_profiles (id, email, role, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'contato@veredictajus.com',
  'admin',
  NOW(),
  NOW()
) 
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Step 2: Create admin profile if admin_profiles table exists
INSERT INTO app_2d8133c678_admin_profiles (id, user_id, full_name, permissions, department, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  'Administrador Veredicta',
  ARRAY['all'],
  'Administração',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  permissions = EXCLUDED.permissions,
  department = EXCLUDED.department;

-- Step 3: Manually create user in Supabase Auth Dashboard:
-- Email: contato@veredictajus.com
-- Password: admin123 (or your preferred password)
-- User ID: 550e8400-e29b-41d4-a716-446655440000 (if possible to set)
