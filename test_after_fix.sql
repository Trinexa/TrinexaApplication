-- QUICK TEST SCRIPT - Run this after applying the ID mismatch fix
-- This will confirm that template creation should now work

-- Check if current user is authenticated and is an admin
SELECT 
  'CURRENT USER STATUS' as check_type,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED'
    ELSE '✅ AUTHENTICATED'
  END as auth_status,
  is_admin_user() as is_admin,
  CASE 
    WHEN is_admin_user() THEN '✅ IS ADMIN'
    ELSE '❌ NOT ADMIN'
  END as admin_status;

-- Check if current user exists in admin_users table with matching ID
SELECT 
  'ADMIN USER LOOKUP' as check_type,
  au.id,
  au.email,
  au.role,
  CASE 
    WHEN au.id = auth.uid() THEN '✅ ID MATCHES AUTH USER'
    ELSE '❌ ID MISMATCH'
  END as id_status
FROM admin_users au
WHERE au.id = auth.uid()
   OR au.email = (SELECT email FROM auth.users WHERE id = auth.uid());

-- Test template creation permissions
SELECT 
  'TEMPLATE CREATION TEST' as check_type,
  CASE 
    WHEN is_admin_user() THEN '✅ SHOULD BE ABLE TO CREATE TEMPLATES'
    ELSE '❌ CANNOT CREATE TEMPLATES - NO ADMIN ACCESS'
  END as creation_status;

-- Show all current admin users with their auth status
SELECT 
  'ALL ADMIN USERS' as check_type,
  au.email,
  au.role,
  au.id as admin_id,
  u.id as auth_id,
  CASE 
    WHEN au.id = u.id THEN '✅ IDs MATCH'
    WHEN u.id IS NULL THEN '⚠️ NO AUTH ACCOUNT'
    ELSE '❌ ID MISMATCH'
  END as status
FROM admin_users au
LEFT JOIN auth.users u ON au.email = u.email
ORDER BY au.email;
