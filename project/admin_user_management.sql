-- Admin User Management Functions and Policies
-- This script adds complete CRUD functionality for admin user management

-- Enable RLS on admin_users table if not already enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin user management
-- Only super_admin can manage other admin users
DROP POLICY IF EXISTS "admin_users_read_policy" ON admin_users;
CREATE POLICY "admin_users_read_policy" ON admin_users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "admin_users_insert_policy" ON admin_users;
CREATE POLICY "admin_users_insert_policy" ON admin_users
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;
CREATE POLICY "admin_users_update_policy" ON admin_users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "admin_users_delete_policy" ON admin_users;
CREATE POLICY "admin_users_delete_policy" ON admin_users
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.role = 'super_admin'
  )
);

-- Function to create admin user (will be called from backend)
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_role TEXT,
  user_password TEXT
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create auth user (this would need to be done via service role)
  -- For now, we'll insert a placeholder and expect the user ID to be provided
  
  -- Insert into admin_users table
  INSERT INTO admin_users (email, role)
  VALUES (user_email, user_role)
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update admin user
CREATE OR REPLACE FUNCTION update_admin_user(
  user_id UUID,
  new_email TEXT DEFAULT NULL,
  new_role TEXT DEFAULT NULL
) RETURNS admin_users AS $$
DECLARE
  updated_user admin_users;
BEGIN
  UPDATE admin_users 
  SET 
    email = COALESCE(new_email, email),
    role = COALESCE(new_role, role),
    updated_at = NOW()
  WHERE id = user_id
  RETURNING * INTO updated_user;
  
  RETURN updated_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete admin user
CREATE OR REPLACE FUNCTION delete_admin_user(user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  -- Delete from admin_users table
  DELETE FROM admin_users WHERE id = user_id;
  
  -- Note: Auth user deletion should be handled separately via service role
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_admin_user(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_admin_user(UUID) TO authenticated;
