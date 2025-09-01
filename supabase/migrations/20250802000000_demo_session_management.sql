-- Enhanced Demo Session Management Database Setup
-- Creates tables for team assignment and scheduling functionality

-- 1. Team Members Table (for assignment to demo sessions)
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL, -- 'BA', 'SE', 'Manager', 'Sales', etc.
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    expertise JSONB DEFAULT '[]', -- Array of skills/expertise areas
    availability JSONB DEFAULT '{}', -- Availability schedule
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Demo Session Assignments Table (links team members to demo sessions)
CREATE TABLE IF NOT EXISTS demo_session_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demo_booking_id UUID NOT NULL,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    role_in_demo VARCHAR(100) NOT NULL, -- 'Lead BA', 'Technical Lead', 'Observer', etc.
    assigned_by UUID, -- Admin user who made the assignment
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(demo_booking_id, team_member_id)
);

-- 3. Demo Session Schedules Table (tracks scheduled sessions)
CREATE TABLE IF NOT EXISTS demo_session_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demo_booking_id UUID NOT NULL UNIQUE,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    google_meet_link TEXT,
    google_event_id VARCHAR(255),
    meeting_room VARCHAR(255),
    agenda TEXT,
    preparation_notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Available Time Slots Table (predefined available slots)
CREATE TABLE IF NOT EXISTS available_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_concurrent_demos INTEGER DEFAULT 1,
    slot_name VARCHAR(100), -- e.g., 'Morning Slot 1', 'Afternoon Slot 2'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Email Templates for Demo Sessions
CREATE TABLE IF NOT EXISTS demo_email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL UNIQUE,
    template_type VARCHAR(100) NOT NULL, -- 'assignment_notification', 'schedule_confirmation', 'reminder', 'cancellation'
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Available template variables
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default time slots (9 AM to 5 PM, 2-hour slots)
INSERT INTO available_time_slots (day_of_week, start_time, end_time, slot_name) VALUES 
-- Monday to Friday
(1, '09:00:00', '11:00:00', 'Morning Slot 1'),
(1, '11:00:00', '13:00:00', 'Morning Slot 2'),
(1, '14:00:00', '16:00:00', 'Afternoon Slot 1'),
(1, '16:00:00', '18:00:00', 'Afternoon Slot 2'),
(2, '09:00:00', '11:00:00', 'Morning Slot 1'),
(2, '11:00:00', '13:00:00', 'Morning Slot 2'),
(2, '14:00:00', '16:00:00', 'Afternoon Slot 1'),
(2, '16:00:00', '18:00:00', 'Afternoon Slot 2'),
(3, '09:00:00', '11:00:00', 'Morning Slot 1'),
(3, '11:00:00', '13:00:00', 'Morning Slot 2'),
(3, '14:00:00', '16:00:00', 'Afternoon Slot 1'),
(3, '16:00:00', '18:00:00', 'Afternoon Slot 2'),
(4, '09:00:00', '11:00:00', 'Morning Slot 1'),
(4, '11:00:00', '13:00:00', 'Morning Slot 2'),
(4, '14:00:00', '16:00:00', 'Afternoon Slot 1'),
(4, '16:00:00', '18:00:00', 'Afternoon Slot 2'),
(5, '09:00:00', '11:00:00', 'Morning Slot 1'),
(5, '11:00:00', '13:00:00', 'Morning Slot 2'),
(5, '14:00:00', '16:00:00', 'Afternoon Slot 1'),
(5, '16:00:00', '18:00:00', 'Afternoon Slot 2')
ON CONFLICT DO NOTHING;

-- Insert sample team members
INSERT INTO team_members (name, email, role, department, expertise) VALUES 
('John Smith', 'john.smith@trinexa.com', 'BA', 'Business Analysis', '["CRM", "Analytics", "Requirements Gathering"]'),
('Sarah Johnson', 'sarah.johnson@trinexa.com', 'BA', 'Business Analysis', '["Process Optimization", "Data Analysis", "Client Relations"]'),
('Mike Chen', 'mike.chen@trinexa.com', 'SE', 'Engineering', '["Full Stack Development", "API Integration", "Database Design"]'),
('Emily Davis', 'emily.davis@trinexa.com', 'SE', 'Engineering', '["Frontend Development", "UI/UX", "React/TypeScript"]'),
('Robert Wilson', 'robert.wilson@trinexa.com', 'Manager', 'Management', '["Project Management", "Team Leadership", "Strategic Planning"]'),
('Lisa Anderson', 'lisa.anderson@trinexa.com', 'Sales', 'Sales', '["Client Acquisition", "Product Demos", "Relationship Management"]')
ON CONFLICT (email) DO NOTHING;

-- Insert default email templates
INSERT INTO demo_email_templates (template_name, template_type, subject, body, variables) VALUES 
('team_assignment_notification', 'assignment_notification', 
'Demo Session Assignment - {{company_name}}', 
'Hi {{team_member_name}},

You have been assigned to a demo session:

Client: {{client_name}} ({{client_email}})
Company: {{company_name}}
Product Interest: {{product_interest}}
Your Role: {{role_in_demo}}
Preferred Date: {{preferred_date}}

Please prepare accordingly and reach out if you have any questions.

Best regards,
Demo Management Team',
'["team_member_name", "client_name", "client_email", "company_name", "product_interest", "role_in_demo", "preferred_date"]'),

('schedule_confirmation', 'schedule_confirmation',
'Demo Session Confirmed - {{scheduled_date}} at {{scheduled_time}}',
'Dear {{client_name}},

Your demo session has been confirmed:

Date: {{scheduled_date}}
Time: {{scheduled_time}} {{timezone}}
Duration: 2 hours
Google Meet Link: {{google_meet_link}}

Team Members:
{{team_members_list}}

Meeting Agenda:
{{agenda}}

Please join the meeting at the scheduled time. If you need to reschedule, please contact us at least 24 hours in advance.

Best regards,
Trinexa Demo Team',
'["client_name", "scheduled_date", "scheduled_time", "timezone", "google_meet_link", "team_members_list", "agenda"]'),

('demo_reminder', 'reminder',
'Reminder: Demo Session Tomorrow - {{company_name}}',
'Hi {{recipient_name}},

This is a friendly reminder about your demo session tomorrow:

Date: {{scheduled_date}}
Time: {{scheduled_time}} {{timezone}}
Google Meet Link: {{google_meet_link}}

See you tomorrow!

Best regards,
Trinexa Team',
'["recipient_name", "scheduled_date", "scheduled_time", "timezone", "google_meet_link"]')
ON CONFLICT (template_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_demo_assignments_booking_id ON demo_session_assignments(demo_booking_id);
CREATE INDEX IF NOT EXISTS idx_demo_assignments_team_member ON demo_session_assignments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_demo_schedules_date ON demo_session_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(is_active);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_session_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_session_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_email_templates ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies (allow authenticated users)
CREATE POLICY "authenticated_access_team_members" ON team_members FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_access_demo_assignments" ON demo_session_assignments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_access_demo_schedules" ON demo_session_schedules FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_access_time_slots" ON available_time_slots FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_access_email_templates" ON demo_email_templates FOR ALL USING (auth.uid() IS NOT NULL);
