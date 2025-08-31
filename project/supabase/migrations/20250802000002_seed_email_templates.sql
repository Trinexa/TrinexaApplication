-- Insert default email templates for the admin invitation system

-- Admin Invitation Template
INSERT INTO email_templates (
  name,
  category,
  subject,
  content,
  variables,
  is_active,
  created_by
) VALUES (
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
        If you have any questions, please contact our support team at {{support_email}}.
      </p>
    </div>
    
    <div style="text-align: center; color: #6b7280; font-size: 14px;">
      <p>Best regards,<br>{{company_name}} Team</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </div>',
  ARRAY['email', 'role', 'invitation_url', 'expires_at', 'company_name', 'support_email'],
  true,
  NULL
);

-- Welcome Template
INSERT INTO email_templates (
  name,
  category,
  subject,
  content,
  variables,
  is_active,
  created_by
) VALUES (
  'Default Welcome Message',
  'transactional',
  'Welcome to {{company_name}} Admin Portal',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1f2937; margin: 0;">Welcome to {{company_name}}!</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">Your account is ready</p>
    </div>
    
    <div style="background-color: #f0f9f4; padding: 30px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #10b981;">
      <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">Hello {{name}},</p>
      <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">
        Your admin account has been successfully created and activated! You can now access the admin portal using your credentials.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{login_url}}" 
           style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; 
                  border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
          Access Admin Portal
        </a>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0;">Getting Started:</h3>
        <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>Log in using your email and the password you set</li>
          <li>Explore the dashboard and available features</li>
          <li>Update your profile settings if needed</li>
          <li>Contact support if you need assistance</li>
        </ul>
      </div>
      
      <p style="color: #374151; line-height: 1.6; margin: 15px 0 0 0;">
        If you need any assistance, please contact our support team at {{support_email}}.
      </p>
    </div>
    
    <div style="text-align: center; color: #6b7280; font-size: 14px;">
      <p>Best regards,<br>{{company_name}} Team</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </div>',
  ARRAY['name', 'email', 'login_url', 'company_name', 'support_email'],
  true,
  NULL
);

-- Password Reset Template
INSERT INTO email_templates (
  name,
  category,
  subject,
  content,
  variables,
  is_active,
  created_by
) VALUES (
  'Default Password Reset',
  'transactional',
  'Password Reset Request - {{company_name}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1f2937; margin: 0;">{{company_name}}</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">Password Reset Request</p>
    </div>
    
    <div style="background-color: #fef3c7; padding: 30px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin: 0 0 20px 0;">Password Reset Request</h2>
      <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">Hello,</p>
      <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">
        We received a request to reset your password for your {{company_name}} admin account.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{reset_url}}" 
           style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; 
                  border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="color: #dc2626; font-weight: 600; margin: 0 0 10px 0;">⏰ Time Sensitive:</p>
        <p style="color: #374151; line-height: 1.6; margin: 0;">
          This password reset link will expire in <strong>1 hour</strong> for security purposes.
        </p>
      </div>
      
      <p style="color: #374151; line-height: 1.6; margin: 15px 0 0 0;">
        If you didn''t request this password reset, please ignore this email and contact our support team at {{support_email}} if you have concerns.
      </p>
    </div>
    
    <div style="text-align: center; color: #6b7280; font-size: 14px;">
      <p>Best regards,<br>{{company_name}} Team</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </div>',
  ARRAY['email', 'reset_url', 'company_name', 'support_email'],
  true,
  NULL
);
