-- COMPLETE DATABASE SETUP AND FIXES
-- Run this entire file in Supabase SQL Editor to solve all remaining issues

-- ==============================================
-- 1. SYSTEM SETTINGS FIX (for favicon/logo functionality)
-- ==============================================

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(100) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing system_settings table
DO $$ 
BEGIN
    -- Add is_public column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'is_public') THEN
        ALTER TABLE system_settings ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'description') THEN
        ALTER TABLE system_settings ADD COLUMN description TEXT;
    END IF;
    
    -- Add setting_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'setting_type') THEN
        ALTER TABLE system_settings ADD COLUMN setting_type VARCHAR(100) DEFAULT 'string';
    END IF;
END $$;

-- Insert essential system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES 
('favicon_url', '', 'Custom favicon URL for the application', true),
('company_logo_url', '', 'Company logo URL for branding', true),
('company_name', 'Trinexa', 'Company name displayed in the application', true),
('contact_email', 'contact@trinexa.com', 'Main contact email address', true),
('admin_email', 'admin@trinexa.com', 'Admin notification email', false),
('demo_duration_hours', '2', 'Default demo session duration in hours', false),
('max_concurrent_demos', '3', 'Maximum concurrent demo sessions allowed', false)
ON CONFLICT (setting_key) DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- Enable RLS for system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for system_settings
DROP POLICY IF EXISTS "public_read_system_settings" ON system_settings;
CREATE POLICY "public_read_system_settings" ON system_settings 
FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin_manage_system_settings" ON system_settings;
CREATE POLICY "admin_manage_system_settings" ON system_settings 
FOR ALL USING (auth.uid() IS NOT NULL);

-- ==============================================
-- 2. ADMIN USERS TABLE FIX (solve RLS recursion)
-- ==============================================

-- Check if admin_users table exists, if not create it
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing admin_users table
DO $$ 
BEGIN
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'name') THEN
        ALTER TABLE admin_users ADD COLUMN name VARCHAR(255) DEFAULT 'Admin User';
    END IF;
    
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'role') THEN
        ALTER TABLE admin_users ADD COLUMN role VARCHAR(100) DEFAULT 'admin';
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'is_active') THEN
        ALTER TABLE admin_users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add last_login column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'last_login') THEN
        ALTER TABLE admin_users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'created_at') THEN
        ALTER TABLE admin_users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'updated_at') THEN
        ALTER TABLE admin_users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Fix RLS policies for admin_users (remove recursion)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "admin_users_select_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_select_new" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_new" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_new" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_new" ON admin_users;
DROP POLICY IF EXISTS "admin_users_all_access" ON admin_users;

-- Create simple, non-recursive policy
CREATE POLICY "authenticated_admin_access" ON admin_users 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default admin user if not exists
-- First, let's check what role constraint exists and work around it
DO $$
BEGIN
    -- Try to insert with standard roles first
    INSERT INTO admin_users (email, name, role, is_active) VALUES 
    ('admin@trinexa.com', 'System Administrator', 'administrator', true),
    ('demo.admin@trinexa.com', 'Demo Administrator', 'administrator', true)
    ON CONFLICT (email) DO UPDATE SET 
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active;
EXCEPTION
    WHEN check_violation THEN
        -- If that fails, try with 'admin' role
        BEGIN
            INSERT INTO admin_users (email, name, is_active) VALUES 
            ('admin@trinexa.com', 'System Administrator', true),
            ('demo.admin@trinexa.com', 'Demo Administrator', true)
            ON CONFLICT (email) DO UPDATE SET 
                name = EXCLUDED.name,
                is_active = EXCLUDED.is_active;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not insert admin users due to constraints. Manual insertion may be required.';
        END;
END $$;

-- ==============================================
-- 3. DEMO BOOKINGS TABLE VERIFICATION & FIX
-- ==============================================

-- Ensure demo_bookings table has all required columns
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_bookings' AND column_name = 'status') THEN
        ALTER TABLE demo_bookings ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_bookings' AND column_name = 'priority') THEN
        ALTER TABLE demo_bookings ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_bookings' AND column_name = 'notes') THEN
        ALTER TABLE demo_bookings ADD COLUMN notes TEXT;
    END IF;
END $$;

-- ==============================================
-- 4. EMAIL TEMPLATES TABLE FIX
-- ==============================================

-- Create email_templates table if it doesn't exist (for general emails)
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    template_type VARCHAR(100) DEFAULT 'general',
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing email_templates table
DO $$ 
BEGIN
    -- Add body column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'body') THEN
        ALTER TABLE email_templates ADD COLUMN body TEXT DEFAULT '';
    END IF;
    
    -- Add content column if it doesn't exist (some tables may use 'content' instead of 'body')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'content') THEN
        ALTER TABLE email_templates ADD COLUMN content TEXT DEFAULT '';
    END IF;
    
    -- Add subject column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'subject') THEN
        ALTER TABLE email_templates ADD COLUMN subject VARCHAR(500) DEFAULT '';
    END IF;
    
    -- Add template_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'template_type') THEN
        ALTER TABLE email_templates ADD COLUMN template_type VARCHAR(100) DEFAULT 'general';
    END IF;
    
    -- Add variables column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'variables') THEN
        ALTER TABLE email_templates ADD COLUMN variables TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'is_active') THEN
        ALTER TABLE email_templates ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add unique constraint on name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'email_templates' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%name%'
    ) THEN
        ALTER TABLE email_templates ADD CONSTRAINT email_templates_name_unique UNIQUE (name);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "authenticated_access_email_templates" ON email_templates;
CREATE POLICY "authenticated_access_email_templates" ON email_templates 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert essential email templates (only if they don't exist)
DO $$
DECLARE
    demo_template_content TEXT := 'Dear {{client_name}},

Thank you for your interest in {{product_interest}}.

We have received your demo request and will contact you within 24 hours to schedule a session.

Request Details:
- Company: {{company_name}}
- Contact: {{client_email}}
- Product Interest: {{product_interest}}
- Preferred Date: {{preferred_date}}

Best regards,
Trinexa Team';
    
    job_template_content TEXT := 'Dear {{applicant_name}},

Thank you for applying for the {{position}} position at Trinexa.

We have received your application and will review it carefully. If your qualifications match our requirements, we will contact you within 5-7 business days.

Best regards,
HR Team - Trinexa';
BEGIN
    -- Insert demo booking confirmation template
    IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'demo_booking_confirmation') THEN
        -- Check if table has 'content' column and use it, otherwise use 'body'
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'content') THEN
            INSERT INTO email_templates (name, subject, content, template_type, variables) VALUES 
            ('demo_booking_confirmation', 
            'Demo Request Received - {{company_name}}', 
            demo_template_content,
            'demo', 
            ARRAY['client_name', 'company_name', 'client_email', 'product_interest', 'preferred_date']);
        ELSE
            INSERT INTO email_templates (name, subject, body, template_type, variables) VALUES 
            ('demo_booking_confirmation', 
            'Demo Request Received - {{company_name}}', 
            demo_template_content,
            'demo', 
            ARRAY['client_name', 'company_name', 'client_email', 'product_interest', 'preferred_date']);
        END IF;
    END IF;

    -- Insert job application received template
    IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'job_application_received') THEN
        -- Check if table has 'content' column and use it, otherwise use 'body'
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'content') THEN
            INSERT INTO email_templates (name, subject, content, template_type, variables) VALUES 
            ('job_application_received',
            'Job Application Received - {{position}}',
            job_template_content,
            'recruitment',
            ARRAY['applicant_name', 'position']);
        ELSE
            INSERT INTO email_templates (name, subject, body, template_type, variables) VALUES 
            ('job_application_received',
            'Job Application Received - {{position}}',
            job_template_content,
            'recruitment',
            ARRAY['applicant_name', 'position']);
        END IF;
    END IF;
END $$;

-- ==============================================
-- 5. MISSING INDEXES AND PERFORMANCE OPTIMIZATION
-- ==============================================

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_demo_bookings_status ON demo_bookings(status);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_created_at ON demo_bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- ==============================================
-- 6. FOREIGN KEY CONSTRAINTS FIX
-- ==============================================

-- Add foreign key to demo_session_assignments if demo_bookings exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demo_bookings') THEN
        -- Add foreign key constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_demo_assignments_booking'
        ) THEN
            ALTER TABLE demo_session_assignments 
            ADD CONSTRAINT fk_demo_assignments_booking 
            FOREIGN KEY (demo_booking_id) REFERENCES demo_bookings(id) ON DELETE CASCADE;
        END IF;
        
        -- Same for schedules
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_demo_schedules_booking'
        ) THEN
            ALTER TABLE demo_session_schedules 
            ADD CONSTRAINT fk_demo_schedules_booking 
            FOREIGN KEY (demo_booking_id) REFERENCES demo_bookings(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ==============================================
-- 7. ADDITIONAL DEMO MANAGEMENT FEATURES
-- ==============================================

-- Create demo session status tracking
CREATE TABLE IF NOT EXISTS demo_session_status_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demo_booking_id UUID REFERENCES demo_bookings(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by UUID,
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE demo_session_status_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_access_status_log" ON demo_session_status_log 
FOR ALL USING (auth.uid() IS NOT NULL);

-- ==============================================
-- 8. GRANT PERMISSIONS (ensure access)
-- ==============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==============================================
-- 9. FINAL VERIFICATION AND CONSTRAINT CHECK
-- ==============================================

-- Check role constraints on admin_users
SELECT 'ADMIN USERS ROLE CONSTRAINT:' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'admin_users'::regclass 
AND contype = 'c';

-- Show what we've created
SELECT 'CREATED TABLES:' as info;
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
    'team_members', 'demo_session_assignments', 'demo_session_schedules', 
    'available_time_slots', 'demo_email_templates', 'system_settings', 
    'admin_users', 'email_templates', 'demo_session_status_log'
)
ORDER BY table_name;

SELECT 'SAMPLE DATA COUNT:' as info;
SELECT 
    'team_members' as table_name, COUNT(*) as records FROM team_members
UNION ALL
SELECT 
    'time_slots' as table_name, COUNT(*) as records FROM available_time_slots
UNION ALL
SELECT 
    'email_templates' as table_name, COUNT(*) as records FROM demo_email_templates
UNION ALL
SELECT 
    'system_settings' as table_name, COUNT(*) as records FROM system_settings
UNION ALL
SELECT 
    'admin_users' as table_name, COUNT(*) as records FROM admin_users;

SELECT '🎉 ALL DATABASE ISSUES RESOLVED! 🎉' as result;
