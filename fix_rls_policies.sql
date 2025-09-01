-- Fix RLS policy for message_templates table
-- This script addresses the Row Level Security policy violation

-- Drop existing policies
DROP POLICY IF EXISTS "Allow admin users to manage message templates" ON message_templates;
DROP POLICY IF EXISTS "Allow admin users to insert message templates" ON message_templates;
DROP POLICY IF EXISTS "Allow admin users to update message templates" ON message_templates;
DROP POLICY IF EXISTS "Allow admin users to delete message templates" ON message_templates;

-- Create a function to check if current user is admin by email
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

-- Create comprehensive policies for message_templates
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON message_templates TO authenticated;
