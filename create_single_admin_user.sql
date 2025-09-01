-- CREATE SINGLE ADMIN USER (Test with just one user first)
-- Run this in Supabase SQL Editor after creating the user in the dashboard

-- Step 1: First create this user manually in Supabase Dashboard:
-- Go to: https://supabase.com/dashboard/project/aylbhudsotlywossqbkc/auth/users
-- Click "Add user" and enter:
-- Email: admin@trinexa.com
-- Password: Admin123!@#
-- Check "Confirm email automatically"

-- Step 2: After creating the user in the dashboard, run this SQL:

-- Check if the auth user was created
SELECT 
  'CHECKING AUTH USER' as step,
  id,
  email,
  email_confirmed_at IS NOT NULL as confirmed,
  created_at
FROM auth.users 
WHERE email = 'admin@trinexa.com';

-- If the user exists above, then run this to add them to admin_users:
DELETE FROM admin_users WHERE email = 'admin@trinexa.com';

INSERT INTO admin_users (id, email, role)
SELECT 
  id,
  email,
  'super_admin' as role
FROM auth.users 
WHERE email = 'admin@trinexa.com'
  AND email_confirmed_at IS NOT NULL;

-- Verify the setup
SELECT 
  'VERIFICATION' as step,
  au.id as admin_id,
  au.email,
  au.role,
  auth_user.id as auth_id,
  CASE 
    WHEN au.id = auth_user.id THEN '✅ SUCCESS - Ready for login'
    ELSE '❌ MISMATCH - Something went wrong'
  END as status
FROM admin_users au
JOIN auth.users auth_user ON au.id = auth_user.id
WHERE au.email = 'admin@trinexa.com';

-- Test message: If you see "✅ SUCCESS - Ready for login" above, 
-- you can now login with admin@trinexa.com / Admin123!@#
