/*
  # Enhanced admin system with user roles and demo assignments

  1. New Tables
    - `demo_assignments` - Assign team members to demo sessions
      - `id` (uuid, primary key)
      - `demo_booking_id` (uuid, references demo_bookings)
      - `admin_user_id` (uuid, references admin_users)
      - `role` (text) - BA, SE, QA, etc.
      - `assigned_at` (timestamp)
      - `assigned_by` (uuid, references admin_users)
    
    - `scheduled_messages` - Store scheduled messages
      - `id` (uuid, primary key)
      - `subject` (text)
      - `content` (text)
      - `recipient_type` (text)
      - `recipient_ids` (uuid[])
      - `scheduled_for` (timestamp)
      - `status` (text) - pending, sent, cancelled
      - `created_by` (uuid, references admin_users)
      - `created_at` (timestamp)

  2. Updates
    - Add status column to demo_bookings
    - Add role-specific permissions

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Add status to demo_bookings if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demo_bookings' AND column_name = 'status'
  ) THEN
    ALTER TABLE demo_bookings ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled'));
  END IF;
END $$;

-- Add status to general_applications if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'general_applications' AND column_name = 'status'
  ) THEN
    ALTER TABLE general_applications ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected'));
  END IF;
END $$;

-- Demo assignments table
CREATE TABLE IF NOT EXISTS demo_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_booking_id uuid REFERENCES demo_bookings(id) ON DELETE CASCADE,
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  role text NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES admin_users(id),
  UNIQUE(demo_booking_id, admin_user_id, role)
);

ALTER TABLE demo_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to manage demo assignments"
  ON demo_assignments
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Scheduled messages table
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  content text NOT NULL,
  recipient_type text NOT NULL,
  recipient_ids uuid[] DEFAULT '{}',
  scheduled_for timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to manage scheduled messages"
  ON scheduled_messages
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Insert dummy admin users
INSERT INTO admin_users (id, email, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@nexusai.com', 'super_admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'content@nexusai.com', 'content_admin'),
  ('550e8400-e29b-41d4-a716-446655440003', 'hr@nexusai.com', 'recruitment_admin'),
  ('550e8400-e29b-41d4-a716-446655440004', 'john.doe@nexusai.com', 'content_admin'),
  ('550e8400-e29b-41d4-a716-446655440005', 'jane.smith@nexusai.com', 'recruitment_admin')
ON CONFLICT (email) DO NOTHING;

-- Insert dummy services
INSERT INTO services (name, description, icon, features) VALUES
  ('NexusAnalytics', 'Advanced predictive analytics platform that transforms your data into actionable insights.', 'BarChart', ARRAY['Real-time data processing', 'Customizable dashboards', 'Anomaly detection', 'Trend forecasting', 'Natural language querying']),
  ('NexusGuard', 'AI-powered security solution that identifies and neutralizes threats before they impact your business.', 'Shield', ARRAY['Threat intelligence', 'Behavioral analysis', 'Zero-day vulnerability detection', 'Automated incident response', '24/7 monitoring']),
  ('NexusFlow', 'Intelligent workflow automation that streamlines your business processes and boosts productivity.', 'Zap', ARRAY['Visual workflow builder', 'AI-powered optimization', 'Integration with major platforms', 'Error detection and recovery', 'Performance analytics']),
  ('NexusAssist', 'Conversational AI assistant that enhances customer support and internal operations.', 'MessageSquare', ARRAY['Natural language processing', 'Multi-channel deployment', 'Knowledge base integration', 'Sentiment analysis', 'Conversation analytics'])
ON CONFLICT DO NOTHING;

-- Insert dummy demo bookings
INSERT INTO demo_bookings (name, email, company, phone, product_interest, message, preferred_date, status) VALUES
  ('John Smith', 'john.smith@techcorp.com', 'TechCorp Inc.', '+1-555-0101', 'NexusAnalytics', 'Interested in predictive analytics for our sales team', '2025-01-20', 'pending'),
  ('Sarah Johnson', 'sarah.j@innovateai.com', 'InnovateAI Ltd.', '+1-555-0102', 'NexusGuard', 'Need security solution for our cloud infrastructure', '2025-01-22', 'scheduled'),
  ('Mike Wilson', 'mike.wilson@dataflow.com', 'DataFlow Systems', '+1-555-0103', 'NexusFlow', 'Looking to automate our data processing workflows', '2025-01-25', 'pending'),
  ('Emily Davis', 'emily.davis@retailnext.com', 'RetailNext', '+1-555-0104', 'NexusAssist', 'Want to improve our customer support with AI', '2025-01-28', 'completed'),
  ('Robert Brown', 'robert.brown@fintech.com', 'FinTech Solutions', '+1-555-0105', 'NexusAnalytics', 'Interested in fraud detection capabilities', '2025-01-30', 'pending')
ON CONFLICT DO NOTHING;

-- Insert dummy general applications
INSERT INTO general_applications (name, email, phone, resume_url, cover_letter, portfolio_url, linkedin_url, status) VALUES
  ('Alice Cooper', 'alice.cooper@email.com', '+1-555-0201', 'https://drive.google.com/file/d/1abc123', 'Experienced AI engineer with 5+ years in machine learning...', 'https://alicecooper.dev', 'https://linkedin.com/in/alicecooper', 'shortlisted'),
  ('Bob Martinez', 'bob.martinez@email.com', '+1-555-0202', 'https://drive.google.com/file/d/2def456', 'Frontend developer passionate about creating intuitive user experiences...', 'https://bobmartinez.portfolio.com', 'https://linkedin.com/in/bobmartinez', 'pending'),
  ('Carol White', 'carol.white@email.com', '+1-555-0203', 'https://drive.google.com/file/d/3ghi789', 'Data scientist with expertise in deep learning and neural networks...', NULL, 'https://linkedin.com/in/carolwhite', 'shortlisted'),
  ('David Lee', 'david.lee@email.com', '+1-555-0204', 'https://drive.google.com/file/d/4jkl012', 'Product manager with experience in AI product development...', 'https://davidlee.pm', 'https://linkedin.com/in/davidlee', 'rejected'),
  ('Eva Rodriguez', 'eva.rodriguez@email.com', '+1-555-0205', 'https://drive.google.com/file/d/5mno345', 'UX designer specializing in AI interface design...', 'https://evarodriguez.design', 'https://linkedin.com/in/evarodriguez', 'pending')
ON CONFLICT DO NOTHING;

-- Insert dummy page content
INSERT INTO page_content (page_id, section_id, content, updated_by) VALUES
  ('home', 'hero', '{"title": "AI-Powered Solutions for the Future", "subtitle": "Transform your business with cutting-edge artificial intelligence"}', '550e8400-e29b-41d4-a716-446655440001'),
  ('about', 'hero', '{"title": "About NexusAI", "subtitle": "Pioneering the future of artificial intelligence"}', '550e8400-e29b-41d4-a716-446655440001'),
  ('products', 'hero', '{"title": "Our AI Products", "subtitle": "Cutting-edge solutions for modern businesses"}', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (page_id, section_id) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now(),
  updated_by = EXCLUDED.updated_by;

-- Insert dummy demo assignments
INSERT INTO demo_assignments (demo_booking_id, admin_user_id, role, assigned_by) 
SELECT 
  db.id,
  au.id,
  CASE 
    WHEN au.email = 'john.doe@nexusai.com' THEN 'Business Analyst'
    WHEN au.email = 'jane.smith@nexusai.com' THEN 'Solutions Engineer'
    WHEN au.email = 'admin@nexusai.com' THEN 'Technical Lead'
  END,
  '550e8400-e29b-41d4-a716-446655440001'
FROM demo_bookings db
CROSS JOIN admin_users au
WHERE db.status = 'scheduled' 
  AND au.email IN ('john.doe@nexusai.com', 'jane.smith@nexusai.com', 'admin@nexusai.com')
ON CONFLICT DO NOTHING;