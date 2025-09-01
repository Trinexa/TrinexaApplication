-- Admin Invitation System Migration (Simplified)
-- This migration adds admin invitations while working with existing email_templates

-- 1. Create admin_invitations table
CREATE TABLE IF NOT EXISTS admin_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Extend admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('pending', 'active', 'suspended', 'deactivated'));

-- 3. Add invitation-specific template types to existing table
INSERT INTO email_templates (name, category, subject, content, variables, is_active) VALUES
(
  'Admin Invitation Email',
  'transactional',
  'You''re invited to join {{company_name}} Admin Portal',
  '<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; background-color: #007bff; color: white; padding: 20px; border-radius: 8px; }
        .content { margin-bottom: 30px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
        .info-box { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{company_name}}</h1>
            <p>Admin Invitation</p>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You have been invited to join <strong>{{company_name}}</strong> as an admin user with the role of <strong>{{role}}</strong>.</p>
            
            <div class="info-box">
                <p><strong>Account Details:</strong></p>
                <p>Email: {{email}}<br>
                Role: {{role}}</p>
            </div>
            
            <div style="text-align: center;">
                <a href="{{invitation_url}}" class="button">Accept Invitation</a>
            </div>
            
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
  ARRAY['company_name', 'email', 'role', 'invitation_url', 'expires_at', 'support_email'],
  true
) ON CONFLICT (name, category) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  variables = EXCLUDED.variables,
  updated_at = now();

-- 4. Welcome email template
INSERT INTO email_templates (name, category, subject, content, variables, is_active) VALUES
(
  'Admin Welcome Email',
  'transactional',
  'Welcome to {{company_name}} - Your Account is Ready',
  '<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; background-color: #28a745; color: white; padding: 20px; border-radius: 8px; }
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
            
            <div style="text-align: center;">
                <a href="{{login_url}}" class="button">Access Admin Portal</a>
            </div>
            
            <p>If you need any assistance, please contact our support team at {{support_email}}.</p>
            
            <p>Best regards,<br>The {{company_name}} Team</p>
        </div>
        <div class="footer">
            <p>© 2025 {{company_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
  ARRAY['name', 'email', 'company_name', 'login_url', 'support_email'],
  true
) ON CONFLICT (name, category) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  variables = EXCLUDED.variables,
  updated_at = now();

-- 5. Create secure functions
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION hash_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(plain_password, gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_password(plain_password TEXT, hashed_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN crypt(plain_password, hashed_password) = hashed_password;
END;
$$ LANGUAGE plpgsql;

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON admin_invitations(email);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON admin_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_status ON admin_invitations(status);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_expires_at ON admin_invitations(expires_at);

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE ON admin_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invitation_token() TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO authenticated;
