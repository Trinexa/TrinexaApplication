import { supabase } from './src/lib/supabase.js';

async function setupEmailTemplates() {
  console.log('Setting up email templates...');
  
  try {
    // First, let's check if the table exists
    const { data, error } = await supabase
      .from('email_templates')
      .select('count(*)')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('email_templates table does not exist. Creating it...');
      
      // Create the table using a direct SQL approach
      // Since we can't execute DDL directly, let's use the SQL editor approach
      console.log('❌ Table does not exist. Please run the following SQL in your Supabase SQL editor:');
      console.log('');
      console.log('-- Create admin_users table if needed');
      console.log(`CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  name text,
  role text DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);`);
      console.log('');
      console.log('-- Create email_templates table');
      console.log(`CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT 'general' CHECK (category IN ('welcome', 'newsletter', 'promotional', 'transactional', 'notification', 'general')),
  subject text NOT NULL,
  content text NOT NULL,
  variables text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, category)
);`);
      console.log('');
      console.log('-- Enable RLS');
      console.log('ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('After running this SQL, run this script again to insert the templates.');
      return;
    }
    
    if (error) {
      console.error('Error checking table:', error);
      return;
    }
    
    console.log('✅ email_templates table exists');
    
    // Insert default templates
    const templates = [
      {
        name: 'Job Application Confirmation',
        category: 'transactional',
        subject: 'Application Received: {{JOB_TITLE}} Position at {{COMPANY_NAME}}',
        content: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .highlight { background-color: #D1FAE5; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #666; }
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
        <h3>What's Next?</h3>
        <ul>
          <li>Our recruitment team will review your application within 3-5 business days</li>
          <li>If your profile matches our requirements, we'll contact you for the next steps</li>
          <li>You'll receive updates via email regarding your application status</li>
        </ul>
      </div>
      
      <p><strong>Application Details:</strong></p>
      <ul>
        <li>Position: {{JOB_TITLE}}</li>
        <li>Application ID: {{APPLICATION_ID}}</li>
        <li>Submitted: {{DATE}}</li>
      </ul>
      
      <p>We appreciate your interest in joining our team. If you have any questions about your application, please don't hesitate to contact us at {{SUPPORT_EMAIL}}.</p>
      
      <p>Best regards,<br>
      The {{COMPANY_NAME}} Recruitment Team</p>
      
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{YEAR}} {{COMPANY_NAME}}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
        variables: ['{{RECIPIENT_NAME}}', '{{JOB_TITLE}}', '{{APPLICATION_ID}}', '{{COMPANY_NAME}}', '{{SUPPORT_EMAIL}}', '{{DATE}}', '{{YEAR}}'],
        is_active: true,
        usage_count: 0,
        created_by: null
      },
      {
        name: 'General Application Confirmation',
        category: 'transactional',
        subject: 'General Application Received - {{COMPANY_NAME}}',
        content: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .highlight { background-color: #D1FAE5; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #666; }
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
          <li>We'll reach out when relevant positions become available</li>
          <li>You'll be among the first to hear about new openings</li>
          <li>Keep an eye on our careers page for current opportunities</li>
        </ul>
      </div>
      
      <p><strong>Application Details:</strong></p>
      <ul>
        <li>Type: General Application</li>
        <li>Application ID: {{APPLICATION_ID}}</li>
        <li>Submitted: {{DATE}}</li>
      </ul>
      
      <p>We truly appreciate your interest in joining our team. While we may not have immediate openings that match your profile, we'll keep your information on file for future consideration.</p>
      
      <p>Feel free to check our careers page regularly for new opportunities, and don't hesitate to contact us at {{SUPPORT_EMAIL}} if you have any questions.</p>
      
      <p>Best regards,<br>
      The {{COMPANY_NAME}} Recruitment Team</p>
      
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{YEAR}} {{COMPANY_NAME}}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
        variables: ['{{RECIPIENT_NAME}}', '{{APPLICATION_ID}}', '{{COMPANY_NAME}}', '{{SUPPORT_EMAIL}}', '{{DATE}}', '{{YEAR}}'],
        is_active: true,
        usage_count: 0,
        created_by: null
      }
    ];
    
    // Insert templates one by one
    for (const template of templates) {
      console.log(`Inserting template: ${template.name}`);
      
      const { error: insertError } = await supabase
        .from('email_templates')
        .upsert(template, { 
          onConflict: 'name,category',
          ignoreDuplicates: false 
        });
        
      if (insertError) {
        console.error(`Error inserting ${template.name}:`, insertError);
      } else {
        console.log(`✅ ${template.name} inserted successfully`);
      }
    }
    
    // Verify insertion
    const { data: verifyData, error: verifyError } = await supabase
      .from('email_templates')
      .select('name, category')
      .eq('category', 'transactional');
      
    if (verifyError) {
      console.error('Error verifying templates:', verifyError);
    } else {
      console.log('📧 Available email templates:', verifyData);
      console.log('✅ Email template setup completed successfully!');
    }
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupEmailTemplates();
