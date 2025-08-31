-- Complete Admin Panel Database Setup
-- This script checks existing tables and creates missing ones for full admin functionality

-- First, let's check what tables exist
SELECT 'EXISTING TABLES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Create missing tables for admin panel functionality

-- 1. Admin Messages/Contact Messages Table
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    priority VARCHAR(20) DEFAULT 'normal',
    source VARCHAR(50) DEFAULT 'contact_form',
    admin_notes TEXT,
    assigned_to UUID,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Business Intelligence Data Table
CREATE TABLE IF NOT EXISTS analytics_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(255) NOT NULL,
    metric_value NUMERIC,
    metric_type VARCHAR(100) NOT NULL,
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Content Management Versions Table
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id VARCHAR(100) NOT NULL,
    section_id VARCHAR(100) NOT NULL,
    content JSONB NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    change_summary TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT false
);

-- 5. Admin Activity Log Table
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. File Uploads Table
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    uploaded_by UUID,
    upload_type VARCHAR(100) DEFAULT 'general',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify tables exist before proceeding
DO $$
BEGIN
    RAISE NOTICE 'Checking if admin_messages table exists...';
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_messages') THEN
        RAISE NOTICE 'admin_messages table found';
    ELSE
        RAISE NOTICE 'admin_messages table NOT found';
    END IF;
END $$;

-- Create indexes for better performance
DO $$
BEGIN
    -- Only create indexes if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_messages') THEN
        CREATE INDEX IF NOT EXISTS idx_admin_messages_status ON admin_messages(status);
        CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at);
        CREATE INDEX IF NOT EXISTS idx_admin_messages_assigned_to ON admin_messages(assigned_to);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_templates') THEN
        CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analytics_data') THEN
        CREATE INDEX IF NOT EXISTS idx_analytics_data_date ON analytics_data(date_recorded);
        CREATE INDEX IF NOT EXISTS idx_analytics_data_metric ON analytics_data(metric_name);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'content_versions') THEN
        CREATE INDEX IF NOT EXISTS idx_content_versions_page ON content_versions(page_id, section_id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_activity_log') THEN
        CREATE INDEX IF NOT EXISTS idx_admin_activity_user ON admin_activity_log(admin_user_id);
        CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_log(created_at);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'file_uploads') THEN
        CREATE INDEX IF NOT EXISTS idx_file_uploads_type ON file_uploads(upload_type);
    END IF;
END $$;

-- Add constraints after tables are created
DO $$
BEGIN
    RAISE NOTICE 'Adding constraints to tables...';
    
    -- Add status constraint for admin_messages
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_messages') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'admin_messages' AND column_name = 'status') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'chk_admin_messages_status' 
                       AND table_name = 'admin_messages') THEN
            ALTER TABLE admin_messages ADD CONSTRAINT chk_admin_messages_status 
                CHECK (status IN ('unread', 'read', 'replied', 'archived'));
            RAISE NOTICE 'Added status constraint to admin_messages';
        END IF;
    ELSE
        RAISE NOTICE 'Skipping admin_messages status constraint - table or column not found';
    END IF;
    
    -- Add priority constraint for admin_messages
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_messages') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'admin_messages' AND column_name = 'priority') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'chk_admin_messages_priority' 
                       AND table_name = 'admin_messages') THEN
            ALTER TABLE admin_messages ADD CONSTRAINT chk_admin_messages_priority 
                CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
            RAISE NOTICE 'Added priority constraint to admin_messages';
        END IF;
    ELSE
        RAISE NOTICE 'Skipping admin_messages priority constraint - table or column not found';
    END IF;

    -- Add template type constraint for email_templates
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_templates') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'template_type') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'chk_email_templates_type' 
                       AND table_name = 'email_templates') THEN
            ALTER TABLE email_templates ADD CONSTRAINT chk_email_templates_type 
                CHECK (template_type IN ('welcome', 'demo_confirmation', 'demo_reminder', 'application_received', 'interview_invitation', 'rejection', 'custom'));
            RAISE NOTICE 'Added template_type constraint to email_templates';
        END IF;
    ELSE
        RAISE NOTICE 'Skipping email_templates constraint - table or column not found';
    END IF;

    -- Add metric type constraint for analytics_data
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analytics_data') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'analytics_data' AND column_name = 'metric_type') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'chk_analytics_data_type' 
                       AND table_name = 'analytics_data') THEN
            ALTER TABLE analytics_data ADD CONSTRAINT chk_analytics_data_type 
                CHECK (metric_type IN ('count', 'percentage', 'currency', 'time', 'custom'));
            RAISE NOTICE 'Added metric_type constraint to analytics_data';
        END IF;
    ELSE
        RAISE NOTICE 'Skipping analytics_data constraint - table or column not found';
    END IF;

    -- Add upload type constraint for file_uploads
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'file_uploads') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'file_uploads' AND column_name = 'upload_type') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'chk_file_uploads_type' 
                       AND table_name = 'file_uploads') THEN
            ALTER TABLE file_uploads ADD CONSTRAINT chk_file_uploads_type 
                CHECK (upload_type IN ('general', 'resume', 'logo', 'favicon', 'image', 'document'));
            RAISE NOTICE 'Added upload_type constraint to file_uploads';
        END IF;
    ELSE
        RAISE NOTICE 'Skipping file_uploads constraint - table or column not found';
    END IF;
    
    RAISE NOTICE 'Constraint addition completed';
END $$;

-- Enable RLS on new tables
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
DO $$
BEGIN
    -- Admin Messages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_messages_read_policy' AND tablename = 'admin_messages') THEN
        CREATE POLICY "admin_messages_read_policy" ON admin_messages
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_messages_insert_policy' AND tablename = 'admin_messages') THEN
        CREATE POLICY "admin_messages_insert_policy" ON admin_messages
        FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_messages_update_policy' AND tablename = 'admin_messages') THEN
        CREATE POLICY "admin_messages_update_policy" ON admin_messages
        FOR UPDATE USING (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_messages_delete_policy' AND tablename = 'admin_messages') THEN
        CREATE POLICY "admin_messages_delete_policy" ON admin_messages
        FOR DELETE USING (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    -- Email Templates policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'email_templates_read_policy' AND tablename = 'email_templates') THEN
        CREATE POLICY "email_templates_read_policy" ON email_templates
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'email_templates_insert_policy' AND tablename = 'email_templates') THEN
        CREATE POLICY "email_templates_insert_policy" ON email_templates
        FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'email_templates_update_policy' AND tablename = 'email_templates') THEN
        CREATE POLICY "email_templates_update_policy" ON email_templates
        FOR UPDATE USING (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'email_templates_delete_policy' AND tablename = 'email_templates') THEN
        CREATE POLICY "email_templates_delete_policy" ON email_templates
        FOR DELETE USING (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    -- Other table policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'analytics_data_read_policy' AND tablename = 'analytics_data') THEN
        CREATE POLICY "analytics_data_read_policy" ON analytics_data
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'content_versions_read_policy' AND tablename = 'content_versions') THEN
        CREATE POLICY "content_versions_read_policy" ON content_versions
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_activity_log_read_policy' AND tablename = 'admin_activity_log') THEN
        CREATE POLICY "admin_activity_log_read_policy" ON admin_activity_log
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'file_uploads_read_policy' AND tablename = 'file_uploads') THEN
        CREATE POLICY "file_uploads_read_policy" ON file_uploads
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
        );
    END IF;
END $$;

-- Insert some sample email templates
INSERT INTO email_templates (name, subject, body, template_type, variables) VALUES 
('welcome_email', 'Welcome to Trinexa!', 'Hello {{name}},\n\nWelcome to Trinexa! We''re excited to have you on board.\n\nBest regards,\nThe Trinexa Team', 'welcome', '{"name": "string"}'),
('demo_confirmation', 'Demo Session Confirmed', 'Hello {{name}},\n\nYour demo session for {{product}} has been confirmed for {{date}} at {{time}}.\n\nMeeting details: {{meeting_link}}\n\nBest regards,\nThe Trinexa Team', 'demo_confirmation', '{"name": "string", "product": "string", "date": "string", "time": "string", "meeting_link": "string"}'),
('application_received', 'Application Received', 'Hello {{name}},\n\nThank you for your application for the {{position}} role. We have received your application and will review it shortly.\n\nWe will be in touch soon.\n\nBest regards,\nThe Trinexa HR Team', 'application_received', '{"name": "string", "position": "string"}')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample analytics data
INSERT INTO analytics_data (metric_name, metric_value, metric_type) VALUES 
('total_users', 1250, 'count'),
('monthly_revenue', 45000.00, 'currency'),
('demo_conversion_rate', 23.5, 'percentage'),
('avg_response_time', 2.5, 'time'),
('active_demos', 15, 'count')
ON CONFLICT DO NOTHING;

-- Check what we've created
SELECT 'TABLES AFTER CREATION:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'SETUP COMPLETE!' as result;
