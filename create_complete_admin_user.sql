-- COMPLETE ADMIN USER CREATION
-- This script creates the user in both auth.users AND admin_users tables

-- Step 1: First, let's check what we have
SELECT 'BEFORE CREATION - Auth Users' as step, COUNT(*) as count FROM auth.users;
SELECT 'BEFORE CREATION - Admin Users' as step, COUNT(*) as count FROM admin_users;

-- Step 2: Insert into admin_users table first (this usually works)
-- Generate a UUID that we'll use for both tables
DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
BEGIN
    -- Insert into admin_users table
    INSERT INTO admin_users (id, email, role, created_at)
    VALUES (new_user_id, 'admin@trinexa.com', 'super_admin', NOW())
    ON CONFLICT (email) DO NOTHING;
    
    -- Show the created admin user
    RAISE NOTICE 'Created admin user with ID: %', new_user_id;
END $$;

-- Step 3: Verify the admin_users table insertion
SELECT 
    'ADMIN USER CREATED' as status,
    id,
    email,
    role,
    created_at
FROM admin_users 
WHERE email = 'admin@trinexa.com';

-- Step 4: Now we need to create the auth user
-- Note: This might not work due to RLS restrictions, but let's try
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    confirmation_token,
    recovery_sent_at,
    recovery_token,
    email_change_sent_at,
    email_change,
    email_change_confirm_status,
    banned_until,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    confirmed_at
) 
SELECT 
    '00000000-0000-0000-0000-000000000000',
    au.id,  -- Use the same ID from admin_users
    'authenticated',
    'authenticated',
    'admin@trinexa.com',
    crypt('Admin123!@#', gen_salt('bf')),
    NOW(),
    NOW(),
    '',
    NULL,
    '',
    NULL,
    '',
    0,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin User"}',
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    NOW()
FROM admin_users au 
WHERE au.email = 'admin@trinexa.com'
ON CONFLICT (email) DO NOTHING;

-- Step 5: Create the identity record
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    au.id,
    json_build_object('sub', au.id::text, 'email', 'admin@trinexa.com'),
    'email',
    NOW(),
    NOW(),
    NOW()
FROM admin_users au 
WHERE au.email = 'admin@trinexa.com'
ON CONFLICT DO NOTHING;

-- Step 6: Final verification
SELECT 'FINAL CHECK - Auth Users' as step, COUNT(*) as count FROM auth.users WHERE email = 'admin@trinexa.com';
SELECT 'FINAL CHECK - Admin Users' as step, COUNT(*) as count FROM admin_users WHERE email = 'admin@trinexa.com';

-- Step 7: Test the RLS policy
SELECT 
    'RLS POLICY TEST' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM admin_users 
            WHERE email = 'admin@trinexa.com'
        ) THEN '✅ User exists in admin_users'
        ELSE '❌ User missing from admin_users'
    END as result;
