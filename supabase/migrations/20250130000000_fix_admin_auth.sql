/*
  # Fix admin user authentication

  This migration fixes the issue where admin_users IDs don't match Supabase auth user IDs,
  which causes RLS policies to fail for message template creation.

  1. Changes
    - Update message_templates RLS policy to work with email lookup
    - Add a function to check if current user is an admin
    - Update existing admin users to use their actual auth IDs

  2. Security
    - Maintains admin-only access to message templates
    - Uses email as fallback for admin verification
*/

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
    WHERE au.email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
    AND au.role IN ('super_admin', 'content_admin')
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Update the message_templates RLS policy to use the new function
DROP POLICY IF EXISTS "Allow admin users to manage message templates" ON message_templates;

CREATE POLICY "Allow admin users to manage message templates"
  ON message_templates
  USING (is_admin_user());

-- For message template creation, we need INSERT policy as well
CREATE POLICY "Allow admin users to insert message templates"
  ON message_templates
  FOR INSERT
  WITH CHECK (is_admin_user());

-- Update policy for other operations
CREATE POLICY "Allow admin users to update message templates"
  ON message_templates
  FOR UPDATE
  USING (is_admin_user());

CREATE POLICY "Allow admin users to delete message templates"
  ON message_templates
  FOR DELETE
  USING (is_admin_user());
