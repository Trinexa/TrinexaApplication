-- Simplified Admin Invitation System Migration
-- This creates a working invitation system that works with existing tables

-- 1. Create admin_invitations table (simple version)
CREATE TABLE IF NOT EXISTS admin_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  invited_by TEXT, -- Store email instead of UUID to avoid auth.users reference
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Add password_hash column to admin_users table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'password_hash') THEN
    ALTER TABLE admin_users ADD COLUMN password_hash TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'is_email_verified') THEN
    ALTER TABLE admin_users ADD COLUMN is_email_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'account_status') THEN
    ALTER TABLE admin_users ADD COLUMN account_status TEXT DEFAULT 'active' CHECK (account_status IN ('pending', 'active', 'suspended', 'deactivated'));
  END IF;
END $$;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON admin_invitations(email);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON admin_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_status ON admin_invitations(status);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_expires_at ON admin_invitations(expires_at);

-- 4. Create function to generate secure invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE admin_invitations 
  SET status = 'expired' 
  WHERE expires_at < NOW() AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to hash passwords using bcrypt
CREATE OR REPLACE FUNCTION hash_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(plain_password, gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(plain_password TEXT, hashed_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN crypt(plain_password, hashed_password) = hashed_password;
END;
$$ LANGUAGE plpgsql;

-- 8. Enable RLS but with simpler policies
ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;

-- 9. Create simple RLS policies that allow authenticated users to access
CREATE POLICY "Allow authenticated users to view invitations" ON admin_invitations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert invitations" ON admin_invitations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update invitations" ON admin_invitations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete invitations" ON admin_invitations
  FOR DELETE USING (auth.role() = 'authenticated');

-- 10. Insert default email templates if they don't exist (using existing schema)
DO $$
BEGIN
  -- Insert admin invitation template
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Default Admin Invitation') THEN
    INSERT INTO email_templates (name, category, subject, content, variables, is_active) VALUES
    (
      'Default Admin Invitation',
      'transactional',
      'You''re invited to join {{company_name}} Admin Portal',
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin: 0;">{{company_name}}</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Admin Portal Invitation</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">You''re Invited!</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">Hello,</p>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">
            You have been invited to join the {{company_name}} admin portal as a <strong>{{role}}</strong>.
          </p>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0;">
            Click the button below to accept your invitation and set up your account:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{invitation_url}}" 
               style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; 
                      border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #dc2626; font-weight: 600; margin: 25px 0 15px 0;">
            ⚠️ Important: This invitation will expire on {{expires_at}}.
          </p>
          <p style="color: #374151; line-height: 1.6; margin: 0;">
            If you have any questions, please contact our support team.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>{{company_name}} Team</p>
        </div>
      </div>',
      ARRAY['email', 'role', 'invitation_url', 'expires_at', 'company_name'],
      true
    );
  END IF;

  -- Insert welcome template
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Default Welcome Message') THEN
    INSERT INTO email_templates (name, category, subject, content, variables, is_active) VALUES
    (
      'Default Welcome Message',
      'transactional',
      'Welcome to {{company_name}} Admin Portal',
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin: 0;">Welcome to {{company_name}}!</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Your account is ready</p>
        </div>
        
        <div style="background-color: #f0f9f4; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">Hello,</p>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">
            Your admin account has been successfully created and activated! You can now access the admin portal.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{login_url}}" 
               style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; 
                      border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Access Admin Portal
            </a>
          </div>
          
          <p style="color: #374151; line-height: 1.6; margin: 15px 0 0 0;">
            If you need any assistance, please contact our support team.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>{{company_name}} Team</p>
        </div>
      </div>',
      ARRAY['email', 'login_url', 'company_name'],
      true
    );
  END IF;
END $$;

-- 11. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invitation_token() TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION expire_old_invitations() TO authenticated;

-- Comments
COMMENT ON TABLE admin_invitations IS 'Stores admin user invitations with secure tokens';
COMMENT ON COLUMN admin_users.password_hash IS 'Bcrypt hashed password for admin authentication';
COMMENT ON COLUMN admin_users.account_status IS 'Current status of the admin account';
