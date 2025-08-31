-- QUICK USER CHECK - Run this first to see what users exist
-- Copy and paste this into your Supabase SQL Editor

-- Check if any auth users exist at all
SELECT 
  'TOTAL AUTH USERS' as check_type,
  COUNT(*) as count
FROM auth.users;

-- Check for our specific admin emails
SELECT 
  'SPECIFIC ADMIN EMAILS' as check_type,
  email,
  id,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users
WHERE email IN ('admin@trinexa.com', 'content@trinexa.com', 'hr@trinexa.com')
ORDER BY created_at DESC;

-- Check what's in admin_users table
SELECT 
  'ADMIN_USERS TABLE' as check_type,
  id,
  email,
  role,
  created_at
FROM admin_users
ORDER BY created_at DESC;

-- Check if admin_users exists at all
SELECT 
  'ADMIN_USERS TABLE EXISTS' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') 
    THEN 'YES' 
    ELSE 'NO' 
  END as table_exists;
