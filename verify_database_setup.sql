-- VERIFICATION SCRIPT - Run this after executing the main setup script
-- This will help you verify that everything is configured correctly

-- =============================================================================
-- DIAGNOSTIC QUERIES - Run these to check your setup
-- =============================================================================

-- 1. Check current authentication status
SELECT 
  'AUTHENTICATION CHECK' as section,
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
  CASE 
    WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED'
    ELSE 'AUTHENTICATED'
  END as auth_status;

-- 2. Check admin_users table
SELECT 
  'ADMIN USERS TABLE' as section,
  id,
  email,
  role,
  created_at
FROM admin_users
ORDER BY role, email;

-- 3. Check if current user is in admin_users (by ID)
SELECT 
  'ADMIN CHECK BY ID' as section,
  CASE 
    WHEN COUNT(*) > 0 THEN 'USER IS ADMIN (by ID match)'
    ELSE 'USER NOT FOUND IN ADMIN_USERS (by ID)'
  END as status,
  COUNT(*) as matches
FROM admin_users 
WHERE id = auth.uid();

-- 4. Check if current user is in admin_users (by email)
SELECT 
  'ADMIN CHECK BY EMAIL' as section,
  au.id as admin_user_id,
  au.email,
  au.role,
  CASE 
    WHEN au.id IS NOT NULL THEN 'USER IS ADMIN (by email match)'
    ELSE 'USER NOT FOUND IN ADMIN_USERS (by email)'
  END as status
FROM auth.users u
LEFT JOIN admin_users au ON u.email = au.email
WHERE u.id = auth.uid();

-- 5. Test the is_admin_user function
SELECT 
  'IS_ADMIN_USER FUNCTION TEST' as section,
  is_admin_user() as function_result,
  CASE 
    WHEN is_admin_user() THEN 'FUNCTION RETURNS TRUE - USER HAS ADMIN ACCESS'
    ELSE 'FUNCTION RETURNS FALSE - USER DOES NOT HAVE ADMIN ACCESS'
  END as interpretation;

-- 6. Check message_templates table structure
SELECT 
  'MESSAGE_TEMPLATES TABLE STRUCTURE' as section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'message_templates'
ORDER BY ordinal_position;

-- 7. Check existing message templates
SELECT 
  'EXISTING MESSAGE TEMPLATES' as section,
  id,
  name,
  category,
  subject,
  created_by,
  created_at
FROM message_templates
ORDER BY created_at DESC;

-- 8. Test template access permissions
SELECT 
  'TEMPLATE ACCESS TEST' as section,
  COUNT(*) as accessible_templates,
  CASE 
    WHEN COUNT(*) > 0 THEN 'USER CAN ACCESS TEMPLATES'
    ELSE 'USER CANNOT ACCESS TEMPLATES - RLS BLOCKING'
  END as access_status
FROM message_templates;

-- 9. Check RLS policies
SELECT 
  'RLS POLICIES' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'message_templates';

-- 10. Test template creation (DRY RUN)
-- This shows what would happen if you try to create a template
SELECT 
  'TEMPLATE CREATION TEST' as section,
  'This would create a test template' as action,
  CASE 
    WHEN is_admin_user() THEN 'CREATION SHOULD WORK'
    ELSE 'CREATION WILL FAIL - NO ADMIN ACCESS'
  END as expected_result;

-- =============================================================================
-- TROUBLESHOOTING QUERIES
-- =============================================================================

-- If you see issues, run these to diagnose:

-- Check if auth.users table has your user
SELECT 
  'AUTH USERS CHECK' as section,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email IN ('admin@nexusai.com', 'content@nexusai.com', 'hr@nexusai.com')
ORDER BY email;

-- Check for ID mismatches between auth.users and admin_users
SELECT 
  'ID MISMATCH CHECK' as section,
  au.email,
  au.id as admin_users_id,
  u.id as auth_users_id,
  CASE 
    WHEN au.id = u.id THEN 'IDs MATCH'
    ELSE 'IDs DO NOT MATCH - NEEDS FIXING'
  END as status
FROM admin_users au
LEFT JOIN auth.users u ON au.email = u.email
ORDER BY au.email;

-- =============================================================================
-- QUICK FIXES (if needed)
-- =============================================================================

-- If you find ID mismatches, uncomment and run this:
-- UPDATE admin_users 
-- SET id = auth_users.id 
-- FROM auth.users auth_users 
-- WHERE admin_users.email = auth_users.email
--   AND admin_users.id != auth_users.id;

-- If you need to create a test template manually:
-- INSERT INTO message_templates (name, category, subject, content, variables) 
-- VALUES ('Test Template', 'custom', 'Test Subject', 'Test content with {name} variable', ARRAY['name']);

-- =============================================================================
-- EXPECTED RESULTS
-- =============================================================================
/*
For a properly configured system, you should see:

1. AUTHENTICATION CHECK: Shows your current user ID and email
2. ADMIN USERS TABLE: Shows 3 admin users with different roles
3. ADMIN CHECK BY ID: Should show "USER IS ADMIN (by ID match)" if IDs match
4. ADMIN CHECK BY EMAIL: Should show your admin user details
5. IS_ADMIN_USER FUNCTION TEST: Should return TRUE
6. TEMPLATE ACCESS TEST: Should show "USER CAN ACCESS TEMPLATES"
7. RLS POLICIES: Should show 4 policies (select, insert, update, delete)

If any of these fail, check the troubleshooting section.
*/
