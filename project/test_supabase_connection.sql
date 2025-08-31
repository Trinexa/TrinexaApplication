-- SUPABASE CONNECTION TEST SCRIPT
-- Run this in your Supabase SQL Editor to test if your connection is active

-- =============================================================================
-- BASIC CONNECTION TEST
-- =============================================================================

-- Test 1: Check if we can execute basic queries
SELECT 
  'CONNECTION TEST' as test_type,
  'SUCCESS - Database connection is active' as status,
  now() as current_time,
  current_database() as database_name,
  current_user as current_user;

-- Test 2: Check authentication system
SELECT 
  'AUTH SYSTEM TEST' as test_type,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'SUCCESS - User is authenticated'
    ELSE 'INFO - No user currently authenticated (this is normal for SQL editor)'
  END as auth_status,
  auth.uid() as user_id;

-- Test 3: Check if your main tables exist
SELECT 
  'TABLE EXISTENCE CHECK' as test_type,
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'admin_users',
    'message_templates', 
    'page_content',
    'demo_assignments',
    'admin_messages',
    'scheduled_messages'
  )
ORDER BY table_name;

-- Test 4: Check RLS (Row Level Security) status
SELECT 
  'RLS STATUS CHECK' as test_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN 'RLS ENABLED'
    ELSE 'RLS DISABLED'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('admin_users', 'message_templates', 'page_content')
ORDER BY tablename;

-- Test 5: Check if your custom functions exist
SELECT 
  'CUSTOM FUNCTIONS CHECK' as test_type,
  routine_name as function_name,
  'EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('is_admin_user')
ORDER BY routine_name;

-- Test 6: Test a simple data query (if you have data)
SELECT 
  'DATA ACCESS TEST' as test_type,
  COUNT(*) as admin_users_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'SUCCESS - Can access admin_users data'
    ELSE 'INFO - admin_users table is empty'
  END as data_status
FROM admin_users;

-- Test 7: Check your Supabase project configuration
SELECT 
  'PROJECT INFO' as test_type,
  setting as project_setting,
  CASE 
    WHEN setting IS NOT NULL THEN 'CONFIGURED'
    ELSE 'NOT SET'
  END as status
FROM pg_settings 
WHERE name IN ('timezone', 'log_statement')
LIMIT 5;
