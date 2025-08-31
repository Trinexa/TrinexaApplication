-- FORCE CREATE ADMIN USER (Alternative Method)
-- If the dashboard method didn't work, try this SQL approach

-- Method 1: Create user via SQL (This might not work due to RLS, but worth trying)
/*
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
  confirmed_at,
  email_change_token_current,
  email_change_confirm_status_current,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
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
  NOW(),
  '',
  0,
  NULL,
  '',
  NULL
);
*/

-- Method 2: Check if signup is enabled
-- If signup is disabled, that could be the issue
SELECT 
  'SIGNUP STATUS' as check_type,
  CASE 
    WHEN current_setting('app.settings.auth.enable_signup', true) = 'true' 
    THEN '✅ Signup is enabled'
    ELSE '❌ Signup is disabled - this could be the issue!'
  END as status;

-- Method 3: Enable signup if it's disabled (run this if above shows disabled)
-- Note: This might require admin privileges
-- ALTER SYSTEM SET app.settings.auth.enable_signup = 'true';

-- Method 4: Check auth configuration
SELECT 
  name,
  setting,
  source
FROM pg_settings 
WHERE name LIKE '%auth%' OR name LIKE '%supabase%'
ORDER BY name;

-- Method 5: Alternative - Create user with different approach
-- First, let's see if we can insert directly into identities table
SELECT 
  'IDENTITIES CHECK' as check_type,
  COUNT(*) as total_identities
FROM auth.identities;

-- If you see results above, try creating the identity directly:
/*
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'admin@trinexa.com'),
  '{"sub":"' || (SELECT id FROM auth.users WHERE email = 'admin@trinexa.com') || '","email":"admin@trinexa.com"}',
  'email',
  NOW(),
  NOW(),
  NOW()
);
*/
