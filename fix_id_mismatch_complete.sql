-- COMPREHENSIVE FIX FOR ID MISMATCH WITH FOREIGN KEY HANDLING
-- This script will update all foreign key references before updating admin_users IDs

-- =============================================================================
-- STEP 1: Update all foreign key references in dependent tables
-- =============================================================================

-- Update page_content table references
UPDATE page_content 
SET updated_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE updated_by = '550e8400-e29b-41d4-a716-446655440001';

UPDATE page_content 
SET updated_by = '7676856b-8e3a-44ae-8f74-d38475ff85f6'
WHERE updated_by = '550e8400-e29b-41d4-a716-446655440002';

UPDATE page_content 
SET updated_by = 'b95e30eb-1d57-43e0-aacd-7995d66b3e81'
WHERE updated_by = '550e8400-e29b-41d4-a716-446655440003';

UPDATE page_content 
SET updated_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE updated_by = '550e8400-e29b-41d4-a716-446655440004';

UPDATE page_content 
SET updated_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE updated_by = '550e8400-e29b-41d4-a716-446655440005';

-- Update message_templates table references
UPDATE message_templates 
SET created_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440001';

UPDATE message_templates 
SET created_by = '7676856b-8e3a-44ae-8f74-d38475ff85f6'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440002';

UPDATE message_templates 
SET created_by = 'b95e30eb-1d57-43e0-aacd-7995d66b3e81'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440003';

UPDATE message_templates 
SET created_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440004';

UPDATE message_templates 
SET created_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440005';

-- Update admin_messages table references (if exists)
UPDATE admin_messages 
SET sent_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE sent_by = '550e8400-e29b-41d4-a716-446655440001';

UPDATE admin_messages 
SET sent_by = '7676856b-8e3a-44ae-8f74-d38475ff85f6'
WHERE sent_by = '550e8400-e29b-41d4-a716-446655440002';

UPDATE admin_messages 
SET sent_by = 'b95e30eb-1d57-43e0-aacd-7995d66b3e81'
WHERE sent_by = '550e8400-e29b-41d4-a716-446655440003';

UPDATE admin_messages 
SET sent_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE sent_by = '550e8400-e29b-41d4-a716-446655440004';

UPDATE admin_messages 
SET sent_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE sent_by = '550e8400-e29b-41d4-a716-446655440005';

-- Update scheduled_messages table references (if exists)
UPDATE scheduled_messages 
SET created_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440001';

UPDATE scheduled_messages 
SET created_by = '7676856b-8e3a-44ae-8f74-d38475ff85f6'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440002';

UPDATE scheduled_messages 
SET created_by = 'b95e30eb-1d57-43e0-aacd-7995d66b3e81'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440003';

UPDATE scheduled_messages 
SET created_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440004';

UPDATE scheduled_messages 
SET created_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE created_by = '550e8400-e29b-41d4-a716-446655440005';

-- Update demo_assignments table references (if exists)
UPDATE demo_assignments 
SET assigned_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE assigned_by = '550e8400-e29b-41d4-a716-446655440001';

UPDATE demo_assignments 
SET assigned_by = '7676856b-8e3a-44ae-8f74-d38475ff85f6'
WHERE assigned_by = '550e8400-e29b-41d4-a716-446655440002';

UPDATE demo_assignments 
SET assigned_by = 'b95e30eb-1d57-43e0-aacd-7995d66b3e81'
WHERE assigned_by = '550e8400-e29b-41d4-a716-446655440003';

UPDATE demo_assignments 
SET assigned_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE assigned_by = '550e8400-e29b-41d4-a716-446655440004';

UPDATE demo_assignments 
SET assigned_by = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE assigned_by = '550e8400-e29b-41d4-a716-446655440005';

-- Update demo_assignments admin_user_id references
UPDATE demo_assignments 
SET admin_user_id = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE admin_user_id = '550e8400-e29b-41d4-a716-446655440001';

UPDATE demo_assignments 
SET admin_user_id = '7676856b-8e3a-44ae-8f74-d38475ff85f6'
WHERE admin_user_id = '550e8400-e29b-41d4-a716-446655440002';

UPDATE demo_assignments 
SET admin_user_id = 'b95e30eb-1d57-43e0-aacd-7995d66b3e81'
WHERE admin_user_id = '550e8400-e29b-41d4-a716-446655440003';

UPDATE demo_assignments 
SET admin_user_id = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE admin_user_id = '550e8400-e29b-41d4-a716-446655440004';

UPDATE demo_assignments 
SET admin_user_id = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE admin_user_id = '550e8400-e29b-41d4-a716-446655440005';

-- =============================================================================
-- STEP 2: Now update the admin_users table IDs
-- =============================================================================

-- Update admin@nexusai.com
UPDATE admin_users 
SET id = '2c3fec7d-681d-4c8b-926e-c68e9a37fd49'
WHERE email = 'admin@nexusai.com' AND id = '550e8400-e29b-41d4-a716-446655440001';

-- Update content@nexusai.com
UPDATE admin_users 
SET id = '7676856b-8e3a-44ae-8f74-d38475ff85f6'
WHERE email = 'content@nexusai.com' AND id = '550e8400-e29b-41d4-a716-446655440002';

-- Update hr@nexusai.com
UPDATE admin_users 
SET id = 'b95e30eb-1d57-43e0-aacd-7995d66b3e81'
WHERE email = 'hr@nexusai.com' AND id = '550e8400-e29b-41d4-a716-446655440003';

-- =============================================================================
-- STEP 3: Handle users without auth accounts (optional)
-- =============================================================================
-- Option 1: Delete unused admin users (uncomment if you want to remove them)
DELETE FROM admin_users WHERE email IN ('john.doe@nexusai.com', 'jane.smith@nexusai.com');

-- =============================================================================
-- STEP 4: Verification queries to confirm the fix
-- =============================================================================

-- Check that IDs now match
SELECT 
  'AFTER FIX - ID MATCH CHECK' as section,
  au.email,
  au.id as admin_users_id,
  u.id as auth_users_id,
  CASE 
    WHEN au.id = u.id THEN '✅ IDs NOW MATCH'
    WHEN u.id IS NULL THEN '⚠️ NO AUTH USER (needs auth account creation)'
    ELSE '❌ IDs STILL DO NOT MATCH'
  END as status
FROM admin_users au
LEFT JOIN auth.users u ON au.email = u.email
ORDER BY au.email;

-- Test the is_admin_user function with current user
SELECT 
  'ADMIN FUNCTION TEST' as section,
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
  is_admin_user() as is_admin_result,
  CASE 
    WHEN is_admin_user() THEN '✅ ADMIN ACCESS GRANTED'
    ELSE '❌ ADMIN ACCESS DENIED'
  END as access_status;

-- Check if current user can now access message templates
SELECT 
  'TEMPLATE ACCESS TEST' as section,
  COUNT(*) as accessible_templates,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ CAN ACCESS TEMPLATES'
    ELSE '❌ CANNOT ACCESS TEMPLATES'
  END as access_result
FROM message_templates;

-- Show current admin users
SELECT 
  'UPDATED ADMIN USERS' as section,
  id,
  email,
  role,
  CASE 
    WHEN id IN (
      SELECT id FROM auth.users
    ) THEN '✅ HAS AUTH ACCOUNT'
    ELSE '⚠️ NO AUTH ACCOUNT'
  END as auth_status
FROM admin_users
ORDER BY email;

-- Check for any remaining foreign key references (should return 0 rows)
SELECT 
  'FOREIGN KEY CHECK - page_content' as section,
  COUNT(*) as remaining_old_references
FROM page_content 
WHERE updated_by IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
);

SELECT 
  'FOREIGN KEY CHECK - message_templates' as section,
  COUNT(*) as remaining_old_references
FROM message_templates 
WHERE created_by IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
);
