-- FIX INFINITE RECURSION IN RLS POLICY
-- The current policy is causing infinite recursion

-- Step 1: Check current policies
SELECT 
    'CURRENT POLICIES' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'admin_users';

-- Step 2: Drop the problematic policy
DROP POLICY IF EXISTS "Allow admin users to read admin_users" ON admin_users;

-- Step 3: Create a simple, non-recursive policy
-- This policy allows authenticated users to read admin_users without recursion
CREATE POLICY "admin_users_select_policy" ON admin_users
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Step 4: Create a policy for insert/update (if needed)
CREATE POLICY "admin_users_insert_policy" ON admin_users
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "admin_users_update_policy" ON admin_users
    FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Step 5: Verify the new policies
SELECT 
    'NEW POLICIES' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'admin_users';

-- Step 6: Test that we can now query admin_users without recursion
SELECT 
    'TEST QUERY' as test,
    COUNT(*) as total_admin_users
FROM admin_users;
