-- COMPLETE DATABASE SETUP SCRIPT FOR MESSAGE TEMPLATES
-- Execute these queries in your Supabase SQL Editor in the following order

-- =============================================================================
-- STEP 1: Drop all existing policies to start fresh
-- =============================================================================
DROP POLICY IF EXISTS "Allow admin users to manage message templates" ON message_templates;
DROP POLICY IF EXISTS "Allow admin users to insert message templates" ON message_templates;
DROP POLICY IF EXISTS "Allow admin users to update message templates" ON message_templates;
DROP POLICY IF EXISTS "Allow admin users to delete message templates" ON message_templates;
DROP POLICY IF EXISTS "Admin users can select message templates" ON message_templates;
DROP POLICY IF EXISTS "Admin users can insert message templates" ON message_templates;
DROP POLICY IF EXISTS "Admin users can update message templates" ON message_templates;
DROP POLICY IF EXISTS "Admin users can delete message templates" ON message_templates;

-- =============================================================================
-- STEP 2: Create helper function to check admin status
-- =============================================================================
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user's auth ID exists in admin_users
  IF EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()) THEN
    RETURN true;
  END IF;
  
  -- Fallback: check by email if auth ID doesn't match
  IF EXISTS (
    SELECT 1 FROM admin_users au
    JOIN auth.users u ON u.email = au.email
    WHERE u.id = auth.uid()
    AND au.role IN ('super_admin', 'content_admin')
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- =============================================================================
-- STEP 3: Create comprehensive RLS policies for message_templates
-- =============================================================================
CREATE POLICY "Admin users can select message templates"
  ON message_templates
  FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Admin users can insert message templates"
  ON message_templates
  FOR INSERT
  WITH CHECK (is_admin_user());

CREATE POLICY "Admin users can update message templates"
  ON message_templates
  FOR UPDATE
  USING (is_admin_user());

CREATE POLICY "Admin users can delete message templates"
  ON message_templates
  FOR DELETE
  USING (is_admin_user());

-- =============================================================================
-- STEP 4: Grant necessary permissions
-- =============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON message_templates TO authenticated;

-- =============================================================================
-- STEP 5: Ensure admin_users table has correct structure and data
-- =============================================================================

-- Check if admin_users table exists and has the right structure
DO $$
BEGIN
  -- Add any missing columns if needed
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'admin_users' AND column_name = 'role') THEN
    ALTER TABLE admin_users ADD COLUMN role text NOT NULL DEFAULT 'content_admin' 
    CHECK (role IN ('super_admin', 'content_admin', 'recruitment_admin'));
  END IF;
END $$;

-- Ensure we have default admin users (only insert if they don't exist)
INSERT INTO admin_users (id, email, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@nexusai.com', 'super_admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'content@nexusai.com', 'content_admin'),
  ('550e8400-e29b-41d4-a716-446655440003', 'hr@nexusai.com', 'recruitment_admin')
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- STEP 6: Update admin_users to link with actual auth users (if they exist)
-- =============================================================================
-- This will link existing admin_users records with actual Supabase auth users
-- Only run this if you have created auth users with matching emails

UPDATE admin_users 
SET id = auth_users.id 
FROM auth.users auth_users 
WHERE admin_users.email = auth_users.email
  AND admin_users.id != auth_users.id;

-- =============================================================================
-- STEP 7: Ensure message_templates table has correct structure
-- =============================================================================
DO $$
BEGIN
  -- Check if created_by column allows NULL (it should for flexibility)
  -- Make sure the table structure is correct
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_templates') THEN
    -- Update the created_by constraint to allow NULL temporarily
    ALTER TABLE message_templates ALTER COLUMN created_by DROP NOT NULL;
  END IF;
END $$;

-- =============================================================================
-- STEP 8: Insert some sample templates for testing
-- =============================================================================
INSERT INTO message_templates (name, category, subject, content, variables, created_by) VALUES
  (
    'Welcome Template', 
    'custom', 
    'Welcome to {company_name}!', 
    'Hello {name},\n\nWelcome to {company_name}! We are excited to have you on board.\n\nBest regards,\nThe Team', 
    ARRAY['name', 'company_name'],
    (SELECT id FROM admin_users WHERE email = 'admin@nexusai.com' LIMIT 1)
  ),
  (
    'Demo Follow-up', 
    'weekly', 
    'Thank you for your demo request', 
    'Hi {name},\n\nThank you for requesting a demo of our products. We will contact you within 24 hours to schedule a convenient time.\n\nBest regards,\n{company_name} Team', 
    ARRAY['name', 'company_name'],
    (SELECT id FROM admin_users WHERE email = 'content@nexusai.com' LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STEP 9: Verify the setup (Optional - for debugging)
-- =============================================================================
-- These queries will help you verify everything is working

-- Check current auth user
SELECT 
  'Current auth user' as info,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email;

-- Check admin_users
SELECT 
  'Admin users' as info,
  id,
  email,
  role
FROM admin_users
ORDER BY email;

-- Test is_admin_user function
SELECT 
  'is_admin_user() result' as info,
  is_admin_user() as is_admin;

-- Check message_templates
SELECT 
  'Message templates count' as info,
  COUNT(*) as total_templates
FROM message_templates;

-- Check if current user can access templates
SELECT 
  'Templates accessible to current user' as info,
  COUNT(*) as accessible_templates
FROM message_templates
WHERE is_admin_user();

-- =============================================================================
-- STEP 10: Create auth users (MANUAL STEP - DO THIS IN SUPABASE DASHBOARD)
-- =============================================================================
/*
IMPORTANT: You need to manually create these auth users in your Supabase Dashboard:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" and create users with these emails:
   - admin@nexusai.com (password: choose a secure password)
   - content@nexusai.com (password: choose a secure password)
   - hr@nexusai.com (password: choose a secure password)

3. After creating the auth users, run STEP 6 again to link them with admin_users table:
   
   UPDATE admin_users 
   SET id = auth_users.id 
   FROM auth.users auth_users 
   WHERE admin_users.email = auth_users.email
     AND admin_users.id != auth_users.id;

4. Test login with one of these accounts and try creating a template.
*/
