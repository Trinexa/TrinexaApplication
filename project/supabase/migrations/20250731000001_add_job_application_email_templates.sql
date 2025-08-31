/*
  # Add default email templates for job applications

  1. Templates
    - Job Application Confirmation template
    - General Application Confirmation template

  These templates include variables that will be replaced with actual values
  when sending emails.
*/

-- Job Application Confirmation Template
INSERT INTO email_templates (
  name,
  category,
  subject,
  content,
  variables,
  is_active,
  usage_count,
  created_at,
  updated_at
) VALUES (
  'Job Application Confirmation',
  'transactional',
  'Application Received: {{JOB_TITLE}} Position at {{COMPANY_NAME}}',
  '<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .highlight { background-color: #D1FAE5; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #666; }
    .button { background-color: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{COMPANY_NAME}}</h1>
      <p>Thank you for your application!</p>
    </div>
    
    <div class="content">
      <h2>Hello {{RECIPIENT_NAME}},</h2>
      
      <p>We have successfully received your application for the <strong>{{JOB_TITLE}}</strong> position at {{COMPANY_NAME}}.</p>
      
      <div class="highlight">
        <h3>What''s Next?</h3>
        <ul>
          <li>Our recruitment team will review your application within 3-5 business days</li>
          <li>If your profile matches our requirements, we''ll contact you for the next steps</li>
          <li>You''ll receive updates via email regarding your application status</li>
        </ul>
      </div>
      
      <p><strong>Application Details:</strong></p>
      <ul>
        <li>Position: {{JOB_TITLE}}</li>
        <li>Application ID: {{APPLICATION_ID}}</li>
        <li>Submitted: {{DATE}}</li>
      </ul>
      
      <p>We appreciate your interest in joining our team. If you have any questions about your application, please don''t hesitate to contact us at {{SUPPORT_EMAIL}}.</p>
      
      <p>Best regards,<br>
      The {{COMPANY_NAME}} Recruitment Team</p>
      
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{YEAR}} {{COMPANY_NAME}}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>',
  ARRAY['{{RECIPIENT_NAME}}', '{{JOB_TITLE}}', '{{APPLICATION_ID}}', '{{COMPANY_NAME}}', '{{SUPPORT_EMAIL}}', '{{DATE}}', '{{YEAR}}'],
  true,
  0,
  now(),
  now()
) ON CONFLICT (name, category) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  variables = EXCLUDED.variables,
  updated_at = now();

-- General Application Confirmation Template
INSERT INTO email_templates (
  name,
  category,
  subject,
  content,
  variables,
  is_active,
  usage_count,
  created_at,
  updated_at
) VALUES (
  'General Application Confirmation',
  'transactional',
  'General Application Received - {{COMPANY_NAME}}',
  '<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .highlight { background-color: #D1FAE5; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #666; }
    .button { background-color: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{COMPANY_NAME}}</h1>
      <p>Thank you for your interest!</p>
    </div>
    
    <div class="content">
      <h2>Hello {{RECIPIENT_NAME}},</h2>
      
      <p>We have successfully received your general application and added your profile to our talent pool at {{COMPANY_NAME}}.</p>
      
      <div class="highlight">
        <h3>What This Means:</h3>
        <ul>
          <li>Your profile will be considered for future opportunities that match your skills</li>
          <li>We''ll reach out when relevant positions become available</li>
          <li>You''ll be among the first to hear about new openings</li>
          <li>Keep an eye on our careers page for current opportunities</li>
        </ul>
      </div>
      
      <p><strong>Application Details:</strong></p>
      <ul>
        <li>Type: General Application</li>
        <li>Application ID: {{APPLICATION_ID}}</li>
        <li>Submitted: {{DATE}}</li>
      </ul>
      
      <p>We truly appreciate your interest in joining our team. While we may not have immediate openings that match your profile, we''ll keep your information on file for future consideration.</p>
      
      <p>Feel free to check our careers page regularly for new opportunities, and don''t hesitate to contact us at {{SUPPORT_EMAIL}} if you have any questions.</p>
      
      <p>Best regards,<br>
      The {{COMPANY_NAME}} Recruitment Team</p>
      
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{YEAR}} {{COMPANY_NAME}}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>',
  ARRAY['{{RECIPIENT_NAME}}', '{{APPLICATION_ID}}', '{{COMPANY_NAME}}', '{{SUPPORT_EMAIL}}', '{{DATE}}', '{{YEAR}}'],
  true,
  0,
  now(),
  now()
) ON CONFLICT (name, category) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  variables = EXCLUDED.variables,
  updated_at = now();
