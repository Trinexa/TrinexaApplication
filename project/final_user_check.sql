-- FINAL USER CREATION VERIFICATION
-- Let's see exactly what we have and create the missing pieces

-- Step 1: Check what exists
SELECT 'AUTH USERS TOTAL' as check_type, COUNT(*) as count FROM auth.users;
SELECT 'ADMIN USERS TOTAL' as check_type, COUNT(*) as count FROM admin_users;

-- Step 2: Look for our specific user
SELECT 'AUTH USER EXISTS' as check_type, email, id, email_confirmed_at IS NOT NULL as confirmed 
FROM auth.users WHERE email = 'admin@trinexa.com';

SELECT 'ADMIN USER EXISTS' as check_type, email, id, role 
FROM admin_users WHERE email = 'admin@trinexa.com';

-- Step 3: Show ALL auth users (to see what's actually there)
SELECT 'ALL AUTH USERS' as check_type, email, id, email_confirmed_at IS NOT NULL as confirmed 
FROM auth.users ORDER BY created_at DESC;

-- Step 4: Show ALL admin users
SELECT 'ALL ADMIN USERS' as check_type, email, id, role 
FROM admin_users ORDER BY created_at DESC;

-- Step 5: Create admin user in admin_users if missing
INSERT INTO admin_users (id, email, role, created_at)
VALUES (gen_random_uuid(), 'admin@trinexa.com', 'super_admin', NOW())
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';

-- Step 6: Show the result
SELECT 'FINAL ADMIN USER' as status, id, email, role 
FROM admin_users WHERE email = 'admin@trinexa.com';
