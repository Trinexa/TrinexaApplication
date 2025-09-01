-- FIX ID MISMATCH BETWEEN admin_users AND auth.users
-- This script will update the admin_users table to use the correct Supabase auth user IDs

-- =============================================================================
-- STEP 1: Update existing admin users with their correct auth user IDs
-- =============================================================================

-- Update admin@nexusai.com
UPDATE admin_users 
SET id = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE email = 'admin@nexusai.com' AND id = '550e8400-e29b-41d4-a716-446655440001';

-- Update content@nexusai.com
UPDATE admin_users 
SET id = '7676856b-8e3a-44ae-8f74-d38475ff85f6'
WHERE email = 'content@nexusai.com' AND id = '550e8400-e29b-41d4-a716-446655440002';

-- Update hr@nexusai.com
UPDATE admin_users 
SET id = 'b95e30eb-1d57-43e0-aacd-7995d66b3e81'
WHERE email = 'hr@nexusai.com' AND id = '550e8400-e29b-41d4-a716-446655440003';

-- =============================================================================
-- STEP 2: Handle users without auth accounts (optional)
-- =============================================================================
-- These users (john.doe@nexusai.com, jane.smith@nexusai.com) don't have auth accounts yet
-- You can either:
-- 1. Delete them if they're not needed
-- 2. Create auth accounts for them in Supabase Dashboard
-- 3. Keep them for now (they won't be able to log in until auth accounts are created)

-- Option 1: Delete unused admin users (uncomment if you want to remove them)
-- DELETE FROM admin_users WHERE email IN ('john.doe@nexusai.com', 'jane.smith@nexusai.com');

-- =============================================================================
-- STEP 3: Update any existing message templates to use correct created_by IDs
-- =============================================================================

-- Update templates created by admin@nexusai.com
UPDATE message_templates 
SET created_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440001';

-- Update templates created by content@nexusai.com
UPDATE message_templates 
SET created_by = '7676856b-8e3a-44ae-8f74-d38475ff85f6'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440002';

-- Update templates created by hr@nexusai.com
UPDATE message_templates 
SET created_by = 'b95e30eb-1d57-43e0-aacd-7995d66b3e81'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440003';

-- Update templates created by john.doe@nexusai.com (set to admin if exists)
UPDATE message_templates 
SET created_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440004';

-- Update templates created by jane.smith@nexusai.com (set to admin if exists)
UPDATE message_templates 
SET created_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440005';

-- =============================================================================
-- STEP 4: Verification queries to confirm the fix
-- =============================================================================

-- Check that IDs now match
SELECT 
  'AFTER FIX - ID MATCH CHECK' as section,
  au.email,
  au.id as admin_users_id,
  u.id as auth_users_id,
  CASE 
    WHEN au.id = u.id THEN '✅ IDs NOW MATCH'
    WHEN u.id IS NULL THEN '⚠️ NO AUTH USER (needs auth account creation)'
    ELSE '❌ IDs STILL DO NOT MATCH'
  END as status
FROM admin_users au
LEFT JOIN auth.users u ON au.email = u.email
ORDER BY au.email;

-- Test the is_admin_user function with current user
SELECT 
  'ADMIN FUNCTION TEST' as section,
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
  is_admin_user() as is_admin_result,
  CASE 
    WHEN is_admin_user() THEN '✅ ADMIN ACCESS GRANTED'
    ELSE '❌ ADMIN ACCESS DENIED'
  END as access_status;

-- Check if current user can now access message templates
SELECT 
  'TEMPLATE ACCESS TEST' as section,
  COUNT(*) as accessible_templates,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ CAN ACCESS TEMPLATES'
    ELSE '❌ CANNOT ACCESS TEMPLATES'
  END as access_result
FROM message_templates;

-- Show current admin users
SELECT 
  'UPDATED ADMIN USERS' as section,
  id,
  email,
  role,
  CASE 
    WHEN id IN (
      SELECT id FROM auth.users
    ) THEN '✅ HAS AUTH ACCOUNT'
    ELSE '⚠️ NO AUTH ACCOUNT'
  END as auth_status
FROM admin_users
ORDER BY email;
