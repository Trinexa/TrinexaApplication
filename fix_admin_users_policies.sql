-- Fix Admin Users RLS Policy Recursion Issue
-- This script fixes the infinite recursion in admin_users policies

-- Step 1: Check current policies on admin_users table
SELECT 'CURRENT ADMIN_USERS POLICIES:' as info;
SELECT policyname, cmd, with_check, qual 
FROM pg_policies 
WHERE tablename = 'admin_users';

-- Step 2: Drop ALL existing policies on admin_users table
DROP POLICY IF EXISTS "admin_users_read_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_select_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_policy" ON admin_users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admin_users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON admin_users;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON admin_users;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON admin_users;

-- Step 3: Create new non-recursive policies with unique names
-- Allow authenticated users to read admin_users (no recursion)
CREATE POLICY "admin_users_select_new" ON admin_users
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert admin_users (no recursion)
CREATE POLICY "admin_users_insert_new" ON admin_users
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update admin_users (no recursion)
CREATE POLICY "admin_users_update_new" ON admin_users
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete admin_users (no recursion)
CREATE POLICY "admin_users_delete_new" ON admin_users
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Step 4: Verify new policies
SELECT 'NEW ADMIN_USERS POLICIES:' as info;
SELECT policyname, cmd, with_check, qual 
FROM pg_policies 
WHERE tablename = 'admin_users';

SELECT 'ADMIN_USERS POLICY FIX COMPLETE!' as result;
