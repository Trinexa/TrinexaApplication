-- ADMIN USER SETUP SCRIPT
-- This script creates admin users in your Supabase project
-- Run this in your Supabase SQL Editor to set up admin accounts

-- =============================================================================
-- STEP 1: First, you need to create these users in Supabase Auth manually
-- =============================================================================

/*
IMPORTANT: Before running this SQL script, you need to create these users in Supabase Auth first:

METHOD 1: Create via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user" and create these accounts:
   - Email: admin@trinexa.com, Password: Admin123!@#
   - Email: content@trinexa.com, Password: Content123!@#
   - Email: hr@trinexa.com, Password: HR123!@#

METHOD 2: Create via API (you can run this in your application)
Use the Supabase Admin API to create users programmatically.

After creating these users in Supabase Auth, come back and run the rest of this script.
*/

-- =============================================================================
-- STEP 2: Link the Supabase auth users to your admin_users table
-- =============================================================================

-- First, let's see what auth users exist
SELECT 
  'EXISTING AUTH USERS' as info,
  id,
  email,
  created_at,
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users
ORDER BY created_at DESC;

-- =============================================================================
-- STEP 3: Update admin_users table with actual auth user IDs
-- =============================================================================

-- Clear existing admin_users and recreate with proper auth IDs
DELETE FROM admin_users;

-- Insert admin users with actual Supabase auth IDs
-- This will only work after you create the users in Supabase Auth first
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
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  role = EXCLUDED.role;

-- =============================================================================
-- STEP 4: Verify the setup
-- =============================================================================

-- Check that admin users are properly linked
SELECT 
  'ADMIN USERS SETUP CHECK' as info,
  au.id as admin_user_id,
  au.email,
  au.role,
  auth_user.id as auth_id,
  CASE 
    WHEN au.id = auth_user.id THEN '✅ IDs MATCH'
    ELSE '❌ ID MISMATCH'
  END as id_status
FROM admin_users au
LEFT JOIN auth.users auth_user ON au.email = auth_user.email
ORDER BY au.email;

-- Test the admin authentication function
SELECT 
  'ADMIN FUNCTION TEST' as info,
  is_admin_user() as is_admin_result,
  auth.uid() as current_auth_id,
  CASE 
    WHEN auth.uid() IS NULL THEN 'ℹ️ No user logged in (normal for SQL editor)'
    ELSE 'User is logged in'
  END as auth_status;

-- =============================================================================
-- STEP 5: Create a test message template to verify everything works
-- =============================================================================

-- This should work after the admin users are properly set up
-- You can run this later when testing from your application
