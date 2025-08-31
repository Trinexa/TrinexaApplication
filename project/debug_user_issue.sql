-- EMERGENCY USER TROUBLESHOOTING
-- Run these queries one by one to diagnose the issue

-- Query 1: Check if ANY users exist in auth.users
SELECT 
  'TOTAL AUTH USERS' as check_type,
  COUNT(*) as total_users
FROM auth.users;

-- Query 2: Look for the specific admin user
SELECT 
  'ADMIN USER CHECK' as check_type,
  id,
  email,
  email_confirmed_at,
  email_confirmed_at IS NOT NULL as is_confirmed,
  created_at,
  last_sign_in_at,
  raw_user_meta_data,
  is_super_admin
FROM auth.users 
WHERE email = 'admin@trinexa.com';

-- Query 3: Check for similar email addresses (in case of typos)
SELECT 
  'SIMILAR EMAILS' as check_type,
  email,
  email_confirmed_at IS NOT NULL as is_confirmed
FROM auth.users 
WHERE email ILIKE '%admin%' OR email ILIKE '%trinexa%';

-- Query 4: Check admin_users table
SELECT 
  'ADMIN_USERS TABLE' as check_type,
  id,
  email,
  role,
  created_at
FROM admin_users 
WHERE email = 'admin@trinexa.com';

-- Query 5: Check if there are any auth users with unconfirmed emails
SELECT 
  'UNCONFIRMED USERS' as check_type,
  email,
  created_at,
  email_confirmed_at,
  confirmation_sent_at
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- Query 6: Check Supabase configuration
SELECT 
  'SUPABASE CONFIG' as check_type,
  current_setting('app.settings.auth.enable_signup', true) as signup_enabled;

-- Query 7: Check if there are any RLS policies blocking access
SELECT 
  'RLS POLICIES' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'admin_users';

-- If all queries above show empty results or issues, 
-- the user was not created successfully in the dashboard.
