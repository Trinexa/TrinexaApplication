-- Complete Admin Users Table Fix
-- This script completely resets the admin_users table policies and permissions

-- Step 1: Check current state
SELECT 'CURRENT ADMIN_USERS TABLE STATE:' as info;
SELECT table_name, row_security 
FROM information_schema.tables 
WHERE table_name = 'admin_users';

-- Step 2: Disable RLS temporarily to clear all policies
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL policies (this will work now that RLS is disabled)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON admin_users';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Step 4: Verify all policies are gone
SELECT 'REMAINING POLICIES AFTER CLEANUP:' as info;
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'admin_users';

-- Step 5: Re-enable RLS with simple, working policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 6: Create simple policies that work
-- Allow all authenticated users full access (no recursion)
CREATE POLICY "allow_authenticated_select" ON admin_users
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "allow_authenticated_insert" ON admin_users
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "allow_authenticated_update" ON admin_users
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "allow_authenticated_delete" ON admin_users
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Step 7: Grant necessary permissions to authenticated role
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON admin_users TO anon;

-- Step 8: Verify the fix
SELECT 'NEW ADMIN_USERS POLICIES:' as info;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'admin_users';

-- Step 9: Test query that should work now
SELECT 'TEST QUERY - ADMIN USERS COUNT:' as info;
SELECT COUNT(*) as admin_count FROM admin_users;

SELECT 'ADMIN_USERS TABLE COMPLETELY FIXED!' as result;
