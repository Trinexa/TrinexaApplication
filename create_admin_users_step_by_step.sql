-- STEP-BY-STEP ADMIN USER SETUP
-- Follow these steps to create admin users in your Supabase project

-- =============================================================================
-- STEP 1: Create Admin Users via Supabase Dashboard
-- =============================================================================

/*
IMPORTANT: You need to create these users in Supabase Auth first!

METHOD 1 - Using Supabase Dashboard (RECOMMENDED):
1. Go to https://supabase.com/dashboard/project/aylbhudsotlywossqbkc
2. Navigate to "Authentication" → "Users"
3. Click "Add user" and create these accounts:

   User 1 (Super Admin):
   - Email: admin@trinexa.com
   - Password: Admin123!@#
   - Email Confirmed: ✓ (check this box)

   User 2 (Content Admin):
   - Email: content@trinexa.com
   - Password: Content123!@#
   - Email Confirmed: ✓ (check this box)

   User 3 (HR Admin):
   - Email: hr@trinexa.com
   - Password: HR123!@#
   - Email Confirmed: ✓ (check this box)

4. After creating these users, come back and run the SQL below
*/

-- =============================================================================
-- STEP 2: Run this SQL in Supabase SQL Editor
-- =============================================================================

-- First, let's see what auth users exist
SELECT 
  'AUTH USERS CHECK' as info,
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users
WHERE email IN ('admin@trinexa.com', 'content@trinexa.com', 'hr@trinexa.com')
ORDER BY created_at DESC;

-- Clear existing admin_users if they exist with wrong IDs
DELETE FROM admin_users WHERE email IN ('admin@trinexa.com', 'content@trinexa.com', 'hr@trinexa.com');

-- Insert admin users with correct Supabase auth IDs
INSERT INTO admin_users (id, email, role)
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.email = 'admin@trinexa.com' THEN 'super_admin'
    WHEN au.email = 'content@trinexa.com' THEN 'content_admin'
    WHEN au.email = 'hr@trinexa.com' THEN 'recruitment_admin'
  END as role
FROM auth.users au
WHERE au.email IN ('admin@trinexa.com', 'content@trinexa.com', 'hr@trinexa.com')
  AND au.email_confirmed_at IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  role = EXCLUDED.role;

-- Verify the setup
SELECT 
  'VERIFICATION' as info,
  au.id as admin_user_id,
  au.email,
  au.role,
  auth_user.id as auth_id,
  auth_user.email_confirmed_at IS NOT NULL as email_confirmed,
  CASE 
    WHEN au.id = auth_user.id THEN '✅ IDs MATCH'
    ELSE '❌ ID MISMATCH'
  END as id_status
FROM admin_users au
LEFT JOIN auth.users auth_user ON au.email = auth_user.email
WHERE au.email IN ('admin@trinexa.com', 'content@trinexa.com', 'hr@trinexa.com')
ORDER BY au.email;

-- Test the admin function
SELECT 
  'ADMIN FUNCTION TEST' as info,
  is_admin_user() as is_admin_result,
  auth.uid() as current_auth_id,
  CASE 
    WHEN auth.uid() IS NULL THEN 'ℹ️ No user logged in (normal for SQL editor)'
    ELSE 'User is logged in'
  END as auth_status;
