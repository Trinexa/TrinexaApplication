-- Ultra Safe Admin Database Setup
-- Checks each step before proceeding

-- Step 1: Check what tables currently exist
SELECT 'CURRENT TABLES:' as step;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Step 2: Create admin_messages table and verify
DO $$
BEGIN
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
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_messages') THEN
        RAISE NOTICE 'admin_messages table created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create admin_messages table';
    END IF;
END $$;

-- Step 3: Create email_templates table and verify
DO $$
BEGIN
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
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_templates') THEN
        RAISE NOTICE 'email_templates table created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create email_templates table';
    END IF;
END $$;

-- Step 4: Create analytics_data table and verify
DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS analytics_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_name VARCHAR(255) NOT NULL,
        metric_value NUMERIC,
        metric_type VARCHAR(100) NOT NULL,
        date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analytics_data') THEN
        RAISE NOTICE 'analytics_data table created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create analytics_data table';
    END IF;
END $$;

-- Step 5: Create remaining tables
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

-- Step 6: Verify email_templates structure before inserting data
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'body') THEN
        RAISE NOTICE 'email_templates body column exists - safe to insert data';
        
        INSERT INTO email_templates (name, subject, body, template_type, variables) VALUES 
        ('welcome_email', 'Welcome to Trinexa!', 'Hello {{name}}, Welcome to Trinexa!', 'welcome', '{"name": "string"}')
        ON CONFLICT (name) DO NOTHING;
        
        RAISE NOTICE 'Sample email template inserted';
    ELSE
        RAISE NOTICE 'email_templates body column does not exist - skipping data insertion';
    END IF;
END $$;

-- Step 7: Insert analytics data safely
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'analytics_data' AND column_name = 'metric_name') THEN
        INSERT INTO analytics_data (metric_name, metric_value, metric_type) VALUES 
        ('total_users', 1250, 'count')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample analytics data inserted';
    ELSE
        RAISE NOTICE 'analytics_data table structure issue - skipping data insertion';
    END IF;
END $$;

-- Final verification
SELECT 'FINAL TABLE LIST:' as step;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'SAFE SETUP COMPLETE!' as result;
