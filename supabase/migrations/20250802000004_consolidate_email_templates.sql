-- Consolidate Email Templates Migration
-- This migration consolidates demo_email_templates into email_templates table

-- 1. First, update email_templates table to support all template categories
DO $$ 
BEGIN
  -- Drop existing category constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%email_templates_category%' 
    AND table_name = 'email_templates'
  ) THEN
    ALTER TABLE email_templates DROP CONSTRAINT IF EXISTS email_templates_category_check;
  END IF;
  
  -- Add comprehensive category constraint that includes existing and new categories
  ALTER TABLE email_templates ADD CONSTRAINT email_templates_category_check 
    CHECK (category IN (
      'transactional',
      'welcome', 
      'newsletter',
      'promotional',
      'notification',
      'general',
      'demo_assignment',
      'demo_confirmation', 
      'demo_reminder',
      'demo_cancellation',
      'demo_general',
      'admin_invitation',
      'password_reset',
      'account_welcome',
      -- Add any existing categories that might be in the database already
      'job_application',
      'recruitment',
      'system',
      'marketing',
      'support',
      'billing',
      'security'
    ));
END $$;

-- 2. Then, migrate all demo email templates to the main email_templates table
DO $$
DECLARE
    demo_template RECORD;
BEGIN
    -- Migrate each template from demo_email_templates to email_templates
    FOR demo_template IN SELECT * FROM demo_email_templates WHERE demo_email_templates.id IS NOT NULL LOOP
        -- Check if template already exists in email_templates
        IF NOT EXISTS (
            SELECT 1 FROM email_templates 
            WHERE name = demo_template.template_name
        ) THEN
            INSERT INTO email_templates (
                name,
                category,
                subject,
                content,
                variables,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                demo_template.template_name,
                CASE 
                    WHEN demo_template.template_type = 'assignment_notification' THEN 'demo_assignment'
                    WHEN demo_template.template_type = 'schedule_confirmation' THEN 'demo_confirmation'
                    WHEN demo_template.template_type = 'reminder' THEN 'demo_reminder'
                    WHEN demo_template.template_type = 'cancellation' THEN 'demo_cancellation'
                    ELSE 'demo_general'
                END,
                demo_template.subject,
                demo_template.body,
                CASE 
                    WHEN demo_template.variables IS NOT NULL THEN
                        ARRAY(SELECT jsonb_array_elements_text(demo_template.variables))
                    ELSE
                        ARRAY[]::TEXT[]
                END,
                demo_template.is_active,
                demo_template.created_at,
                demo_template.updated_at
            );
        END IF;
    END LOOP;
EXCEPTION
    WHEN undefined_table THEN
        -- demo_email_templates table doesn't exist, skip migration
        RAISE NOTICE 'demo_email_templates table does not exist, skipping migration';
END $$;

-- 3. Add additional templates that are commonly needed
DO $$
BEGIN
  -- Demo Assignment Notification Template
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Demo Assignment Notification') THEN
    INSERT INTO email_templates (name, category, subject, content, variables, is_active) VALUES
    (
      'Demo Assignment Notification',
      'demo_assignment',
      'Demo Session Assignment - {{company_name}}',
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin: 0;">Demo Assignment</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">{{company_name}}</p>
        </div>
        
        <div style="background-color: #eff6ff; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1e40af; margin: 0 0 20px 0;">You''ve Been Assigned a Demo Session</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">Hi {{team_member_name}},</p>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
            You have been assigned to conduct a demo session for the following client:
          </p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <table style="width: 100%; color: #374151;">
              <tr><td><strong>Client:</strong></td><td>{{client_name}} ({{client_email}})</td></tr>
              <tr><td><strong>Company:</strong></td><td>{{company_name}}</td></tr>
              <tr><td><strong>Product Interest:</strong></td><td>{{product_interest}}</td></tr>
              <tr><td><strong>Your Role:</strong></td><td>{{role_in_demo}}</td></tr>
              <tr><td><strong>Preferred Date:</strong></td><td>{{preferred_date}}</td></tr>
            </table>
          </div>
          
          <p style="color: #374151; line-height: 1.6; margin: 20px 0 0 0;">
            Please prepare accordingly and reach out if you have any questions.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>Demo Management Team</p>
        </div>
      </div>',
      ARRAY['team_member_name', 'client_name', 'client_email', 'company_name', 'product_interest', 'role_in_demo', 'preferred_date'],
      true
    );
  END IF;

  -- Demo Schedule Confirmation Template
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Demo Schedule Confirmation') THEN
    INSERT INTO email_templates (name, category, subject, content, variables, is_active) VALUES
    (
      'Demo Schedule Confirmation',
      'demo_confirmation',
      'Demo Session Confirmed - {{scheduled_date}} at {{scheduled_time}}',
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin: 0;">Demo Session Confirmed</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">{{company_name}}</p>
        </div>
        
        <div style="background-color: #f0f9f4; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #10b981; margin: 0 0 20px 0;">Your Demo is Scheduled!</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">Dear {{client_name}},</p>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
            Your demo session has been confirmed with the following details:
          </p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <table style="width: 100%; color: #374151;">
              <tr><td><strong>Date:</strong></td><td>{{scheduled_date}}</td></tr>
              <tr><td><strong>Time:</strong></td><td>{{scheduled_time}} {{timezone}}</td></tr>
              <tr><td><strong>Duration:</strong></td><td>2 hours</td></tr>
              <tr><td><strong>Meeting Link:</strong></td><td><a href="{{google_meet_link}}" style="color: #3b82f6;">Join Demo Session</a></td></tr>
            </table>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Team Members:</h3>
            <p style="color: #374151; margin: 0;">{{team_members}}</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6; margin: 20px 0 0 0;">
            We look forward to demonstrating our solutions for your business needs!
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>{{company_name}} Team</p>
        </div>
      </div>',
      ARRAY['client_name', 'scheduled_date', 'scheduled_time', 'timezone', 'google_meet_link', 'team_members', 'company_name'],
      true
    );
  END IF;

  -- Demo Reminder Template
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Demo Session Reminder') THEN
    INSERT INTO email_templates (name, category, subject, content, variables, is_active) VALUES
    (
      'Demo Session Reminder',
      'demo_reminder',
      'Reminder: Demo Session Tomorrow at {{scheduled_time}}',
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin: 0;">Demo Reminder</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">{{company_name}}</p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #92400e; margin: 0 0 20px 0;">Your Demo Session is Tomorrow!</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">Dear {{client_name}},</p>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
            This is a friendly reminder about your upcoming demo session:
          </p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <table style="width: 100%; color: #374151;">
              <tr><td><strong>Date:</strong></td><td>{{scheduled_date}}</td></tr>
              <tr><td><strong>Time:</strong></td><td>{{scheduled_time}} {{timezone}}</td></tr>
              <tr><td><strong>Meeting Link:</strong></td><td><a href="{{google_meet_link}}" style="color: #3b82f6;">Join Demo Session</a></td></tr>
            </table>
          </div>
          
          <p style="color: #374151; line-height: 1.6; margin: 20px 0 0 0;">
            Please make sure to join the meeting at the scheduled time. If you need to reschedule, please contact us as soon as possible.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>{{company_name}} Team</p>
        </div>
      </div>',
      ARRAY['client_name', 'scheduled_date', 'scheduled_time', 'timezone', 'google_meet_link', 'company_name'],
      true
    );
  END IF;
END $$;

-- 4. Drop the demo_email_templates table (after migration)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demo_email_templates') THEN
        DROP TABLE demo_email_templates CASCADE;
        RAISE NOTICE 'demo_email_templates table dropped successfully';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop demo_email_templates table: %', SQLERRM;
END $$;

-- 5. Update any references or API calls (this would be done in application code)
COMMENT ON TABLE email_templates IS 'Unified email templates table for all system notifications including demo sessions, admin invitations, and general communications';
COMMENT ON COLUMN email_templates.category IS 'Template category: transactional, demo_*, admin_*, notification, etc.';

-- 6. Create indexes for better performance with categories
CREATE INDEX IF NOT EXISTS idx_email_templates_category_active ON email_templates(category, is_active) WHERE is_active = true;
