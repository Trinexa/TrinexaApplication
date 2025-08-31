-- Admin Invitation System Migration
-- This migration adds the necessary tables and functions for admin user invitations

-- 1. Create admin_invitations table for managing user invitations
CREATE TABLE IF NOT EXISTS admin_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  invited_by UUID REFERENCES auth.users(id),
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Modify existing email_templates table for admin invitation system
-- First check if columns exist and add them if needed
DO $$ 
BEGIN
  -- Add html_content column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'html_content') THEN
    ALTER TABLE email_templates ADD COLUMN html_content TEXT;
  END IF;
  
  -- Add text_content column if it doesn't exist  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'text_content') THEN
    ALTER TABLE email_templates ADD COLUMN text_content TEXT;
  END IF;
  
  -- Add template_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'template_type') THEN
    ALTER TABLE email_templates ADD COLUMN template_type TEXT CHECK (template_type IN ('admin_invitation', 'password_reset', 'account_welcome', 'welcome', 'newsletter', 'promotional', 'transactional', 'notification', 'general'));
  END IF;
  
  -- Update created_by to TEXT if it's UUID
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'created_by' AND data_type = 'uuid') THEN
    ALTER TABLE email_templates ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;
  END IF;
END $$;

-- 3. Add password_hash column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'suspended', 'deactivated'));

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON admin_invitations(email);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON admin_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_status ON admin_invitations(status);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_expires_at ON admin_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(account_status);

-- 5. Insert default email templates (only if they don't exist)
DO $$
BEGIN
  -- Insert admin invitation template
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Default Admin Invitation Template') THEN
    INSERT INTO email_templates (name, template_type, category, subject, html_content, text_content, variables, content) VALUES
    (
      'Default Admin Invitation Template',
      'admin_invitation',
      'transactional',
      'You''re invited to join {{company_name}} Admin Portal',
      '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Admin Account Invitation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin-bottom: 30px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
        .info-box { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{company_name}}</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You have been invited to join <strong>{{company_name}}</strong> as an admin user with the role of <strong>{{role}}</strong>.</p>
            
            <div class="info-box">
                <p><strong>Account Details:</strong></p>
                <p>Email: {{email}}<br>
                Role: {{role}}</p>
            </div>
            
            <center>
                <a href="{{invitation_url}}" class="button">Accept Invitation</a>
            </center>
            
            <p><strong>Important:</strong> This invitation link will expire on {{expires_at}}. Please complete your account setup before then.</p>
            
            <p>If you have any questions, please contact our support team at {{support_email}}.</p>
            
            <p>Best regards,<br>The {{company_name}} Team</p>
        </div>
        <div class="footer">
            <p>© 2025 {{company_name}}. All rights reserved.</p>
            <p>If you did not expect this invitation, please ignore this email.</p>
        </div>
    </div>
</body>
</html>',
      'Welcome to {{company_name}}

You have been invited to join {{company_name}} as an admin user.

Account Details:
- Email: {{email}}
- Role: {{role}}

To complete your account setup, please visit: {{invitation_url}}

This invitation expires on {{expires_at}}.

If you have any questions, contact us at {{support_email}}.

Best regards,
The {{company_name}} Team

© 2025 {{company_name}}. All rights reserved.',
      ARRAY['company_name', 'email', 'role', 'invitation_url', 'expires_at', 'support_email'],
      'Welcome to {{company_name}} - Admin Invitation (HTML version above)'
    );
  END IF;

  -- Insert welcome template
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Default Welcome Template') THEN
    INSERT INTO email_templates (name, template_type, category, subject, html_content, text_content, variables, content) VALUES
    (
      'Default Welcome Template',
      'account_welcome',
      'welcome',
      'Welcome to {{company_name}} - Your Account is Ready',
      '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to {{company_name}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin-bottom: 30px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{company_name}}!</h1>
        </div>
        <div class="content">
            <p>Hello {{name}},</p>
            <p>Your admin account has been successfully created. You can now access the admin portal using your credentials.</p>
            
            <center>
                <a href="{{login_url}}" class="button">Access Admin Portal</a>
            </center>
            
            <p>If you need any assistance, please contact our support team at {{support_email}}.</p>
            
            <p>Best regards,<br>The {{company_name}} Team</p>
        </div>
        <div class="footer">
            <p>© 2025 {{company_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
      'Welcome to {{company_name}}!

Hello {{name}},

Your admin account has been successfully created. You can now access the admin portal at: {{login_url}}

If you need any assistance, please contact our support team at {{support_email}}.

Best regards,
The {{company_name}} Team

© 2025 {{company_name}}. All rights reserved.',
      ARRAY['name', 'email', 'company_name', 'login_url', 'support_email'],
      'Welcome to {{company_name}} - Account Welcome (HTML version above)'
    );
  END IF;
END $$;

-- 6. Create function to generate secure invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE admin_invitations 
  SET status = 'expired' 
  WHERE expires_at < NOW() AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to hash passwords (simplified - in production use proper bcrypt)
CREATE OR REPLACE FUNCTION hash_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- In production, use a proper password hashing library
  -- This is a simplified version for demonstration
  RETURN crypt(plain_password, gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(plain_password TEXT, hashed_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN crypt(plain_password, hashed_password) = hashed_password;
END;
$$ LANGUAGE plpgsql;

-- 10. Enable RLS (Row Level Security)
ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for admin_invitations
CREATE POLICY "Admin users can view all invitations" ON admin_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_users.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin users can insert invitations" ON admin_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_users.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin users can update invitations" ON admin_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_users.role IN ('super_admin', 'admin')
    )
  );

-- 12. Create RLS policies for email_templates
CREATE POLICY "Admin users can view all email templates" ON email_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_users.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin users can manage email templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_users.role IN ('super_admin', 'admin')
    )
  );

-- 13. Create trigger to automatically expire old invitations
CREATE OR REPLACE FUNCTION trigger_expire_invitations()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM expire_old_invitations();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 14. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON admin_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_templates TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invitation_token() TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO authenticated;

COMMENT ON TABLE admin_invitations IS 'Stores admin user invitations with secure tokens';
COMMENT ON TABLE email_templates IS 'Configurable email templates for various system notifications';
COMMENT ON COLUMN admin_users.password_hash IS 'Bcrypt hashed password for admin authentication';
COMMENT ON COLUMN admin_users.account_status IS 'Current status of the admin account';
