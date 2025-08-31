-- Debug script to check authentication and admin user status
-- Run this in your Supabase SQL Editor to debug the authentication issue

-- Check current session information
SELECT 
  'Current auth user' as info,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email;

-- Check admin_users table
SELECT 
  'Admin users in database' as info,
  id,
  email,
  role
FROM admin_users
ORDER BY email;

-- Check if current user is in admin_users (by ID)
SELECT 
  'Current user in admin_users by ID' as info,
  COUNT(*) as count
FROM admin_users 
WHERE id = auth.uid();

-- Check if current user is in admin_users (by email)
SELECT 
  'Current user in admin_users by email' as info,
  au.id,
  au.email,
  au.role
FROM admin_users au
JOIN auth.users u ON u.email = au.email
WHERE u.id = auth.uid();

-- Test the is_admin_user function
SELECT 
  'is_admin_user() result' as info,
  is_admin_user() as is_admin;

-- Check message_templates table permissions
SELECT 
  'Message templates count' as info,
  COUNT(*) as total_templates
FROM message_templates;

-- Test inserting a template (this will show the exact error)
-- Uncomment the following line to test (remove the -- at the beginning)
-- INSERT INTO message_templates (name, category, subject, content, variables) VALUES ('Test Template', 'custom', 'Test Subject', 'Test Content', ARRAY['test']);
