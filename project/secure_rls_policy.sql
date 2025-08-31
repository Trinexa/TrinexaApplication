-- SECURE RLS POLICY (NON-RECURSIVE)
-- This approach avoids recursion while maintaining security

-- Drop existing policies
DROP POLICY IF EXISTS "admin_users_select_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;

-- Create a secure policy using auth.users table directly
-- This avoids recursion by checking auth.users instead of admin_users
CREATE POLICY "secure_admin_users_policy" ON admin_users
    FOR ALL 
    TO authenticated 
    USING (
        -- Check if the authenticated user exists in auth.users with this email
        EXISTS (
            SELECT 1 
            FROM auth.users au 
            WHERE au.id = auth.uid() 
            AND au.email IN (
                'admin@trinexa.com',
                'hr@nexusai.com'
                -- Add more admin emails as needed
            )
        )
    );

-- Test the secure policy
SELECT 
    'SECURE POLICY TEST' as test,
    COUNT(*) as admin_count
FROM admin_users;
