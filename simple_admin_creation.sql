-- SIMPLE ADMIN USER CREATION (RELIABLE METHOD)
-- This approach focuses on what actually works

-- Step 1: Check current state
SELECT 'BEFORE - Auth Users' as step, COUNT(*) as count FROM auth.users;
SELECT 'BEFORE - Admin Users' as step, COUNT(*) as count FROM admin_users;

-- Step 2: Create admin user in admin_users table (this always works)
INSERT INTO admin_users (id, email, role, created_at)
VALUES (gen_random_uuid(), 'admin@trinexa.com', 'super_admin', NOW())
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', created_at = NOW();

-- Step 3: Show the admin user we created
SELECT 
    'ADMIN USER READY' as status,
    id,
    email,
    role,
    created_at
FROM admin_users 
WHERE email = 'admin@trinexa.com';

-- Step 4: Check if auth user exists (will likely be empty)
SELECT 
    'AUTH USER CHECK' as status,
    COUNT(*) as count
FROM auth.users 
WHERE email = 'admin@trinexa.com';

-- Step 5: Instructions for manual creation
SELECT 
    'NEXT STEPS' as instruction,
    'Go to Supabase Dashboard > Authentication > Users > Add User' as action,
    'Email: admin@trinexa.com, Password: Admin123!@#, Auto-confirm: YES' as details;

-- Step 6: After manual user creation, run this to sync the IDs
-- (You'll need to replace USER_ID_FROM_DASHBOARD with the actual ID)
/*
UPDATE admin_users 
SET id = 'USER_ID_FROM_DASHBOARD'
WHERE email = 'admin@trinexa.com';
*/

-- Step 7: Verification query (run this after manual user creation)
SELECT 
    'VERIFICATION' as test,
    au.id as admin_users_id,
    u.id as auth_users_id,
    CASE 
        WHEN au.id = u.id THEN '✅ IDs MATCH - SUCCESS!'
        ELSE '❌ IDs DO NOT MATCH - NEED TO SYNC'
    END as status
FROM admin_users au
LEFT JOIN auth.users u ON u.email = au.email
WHERE au.email = 'admin@trinexa.com';
