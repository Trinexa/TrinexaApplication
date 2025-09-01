/*
  # Enhanced admin system with message templates and product management

  1. New Tables
    - `message_templates` - Reusable message templates
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text) - daily, weekly, monthly, yearly, custom
      - `subject` (text)
      - `content` (text)
      - `variables` (text[]) - placeholder variables like {name}, {company}
      - `created_by` (uuid, references admin_users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `products` - Enhanced product management
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `status` (text) - active, inactive, development
      - `pricing` (jsonb) - pricing tiers and details
      - `features` (text[])
      - `technical_specs` (jsonb)
      - `documentation_url` (text)
      - `demo_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `product_analytics` - Product usage analytics
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `metric_name` (text)
      - `metric_value` (numeric)
      - `date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  subject text NOT NULL,
  content text NOT NULL,
  variables text[] DEFAULT '{}',
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to manage message templates"
  ON message_templates
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Enhanced products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'development')),
  pricing jsonb DEFAULT '{}',
  features text[] DEFAULT '{}',
  technical_specs jsonb DEFAULT '{}',
  documentation_url text,
  demo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active products"
  ON products
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Allow admin users to manage products"
  ON products
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Product analytics table
CREATE TABLE IF NOT EXISTS product_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to manage product analytics"
  ON product_analytics
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Insert dummy message templates
INSERT INTO message_templates (name, category, subject, content, variables, created_by) VALUES
  ('Welcome New User', 'custom', 'Welcome to NexusAI, {name}!', 'Dear {name},\n\nWelcome to NexusAI! We''re excited to have {company} join our community of innovative businesses.\n\nYour account is now active and you can start exploring our AI solutions.\n\nBest regards,\nThe NexusAI Team', ARRAY['name', 'company'], '550e8400-e29b-41d4-a716-446655440001'),
  
  ('Demo Confirmation', 'custom', 'Demo Session Confirmed - {product}', 'Hi {name},\n\nYour demo session for {product} has been confirmed for {date} at {time}.\n\nMeeting details:\n- Product: {product}\n- Date: {date}\n- Time: {time}\n- Duration: 60 minutes\n\nOur team will contact you shortly with the meeting link.\n\nBest regards,\nNexusAI Demo Team', ARRAY['name', 'product', 'date', 'time'], '550e8400-e29b-41d4-a716-446655440001'),
  
  ('Weekly Newsletter', 'weekly', 'NexusAI Weekly Update - Week of {week}', 'Hello {name},\n\nHere''s your weekly update from NexusAI:\n\n🚀 Product Updates:\n- New features released in NexusAnalytics\n- Performance improvements in NexusGuard\n\n📊 This Week''s Highlights:\n- {highlights}\n\n📅 Upcoming Events:\n- {events}\n\nStay innovative!\nThe NexusAI Team', ARRAY['name', 'week', 'highlights', 'events'], '550e8400-e29b-41d4-a716-446655440001'),
  
  ('Monthly Report', 'monthly', 'Your Monthly AI Insights - {month}', 'Dear {name},\n\nYour monthly AI insights report for {month} is ready!\n\n📈 Key Metrics:\n- Usage: {usage}\n- Performance: {performance}\n- ROI: {roi}\n\n💡 Recommendations:\n{recommendations}\n\nView your full report: {report_link}\n\nBest regards,\nNexusAI Analytics Team', ARRAY['name', 'month', 'usage', 'performance', 'roi', 'recommendations', 'report_link'], '550e8400-e29b-41d4-a716-446655440001'),
  
  ('Annual Review', 'yearly', 'Your 2024 AI Journey with NexusAI', 'Dear {name},\n\nAs we wrap up {year}, let''s celebrate your AI journey with NexusAI!\n\n🎯 Year in Review:\n- Total AI models deployed: {models_deployed}\n- Cost savings achieved: {cost_savings}\n- Efficiency improvements: {efficiency_gains}\n\n🏆 Achievements:\n{achievements}\n\n🔮 Looking ahead to {next_year}:\n{future_plans}\n\nThank you for being part of the AI revolution!\n\nThe NexusAI Team', ARRAY['name', 'year', 'models_deployed', 'cost_savings', 'efficiency_gains', 'achievements', 'next_year', 'future_plans'], '550e8400-e29b-41d4-a716-446655440001'),
  
  ('Interview Invitation', 'custom', 'Interview Invitation - {position}', 'Dear {name},\n\nThank you for your interest in the {position} role at NexusAI.\n\nWe''re impressed with your background and would like to invite you for an interview.\n\nInterview Details:\n- Position: {position}\n- Date: {date}\n- Time: {time}\n- Duration: {duration}\n- Format: {format}\n\nPlease confirm your availability by replying to this email.\n\nBest regards,\nNexusAI Recruitment Team', ARRAY['name', 'position', 'date', 'time', 'duration', 'format'], '550e8400-e29b-41d4-a716-446655440003'),
  
  ('Application Status Update', 'custom', 'Application Update - {position}', 'Dear {name},\n\nThank you for your application for the {position} role at NexusAI.\n\nWe wanted to update you on the status of your application: {status}\n\n{status_details}\n\nNext steps:\n{next_steps}\n\nIf you have any questions, please don''t hesitate to reach out.\n\nBest regards,\nNexusAI Recruitment Team', ARRAY['name', 'position', 'status', 'status_details', 'next_steps'], '550e8400-e29b-41d4-a716-446655440003');

-- Insert enhanced products
INSERT INTO products (name, description, category, status, pricing, features, technical_specs, documentation_url, demo_url) VALUES
  (
    'NexusAnalytics Pro',
    'Advanced predictive analytics platform with real-time insights and machine learning capabilities.',
    'Analytics',
    'active',
    '{"starter": {"price": 499, "features": ["Basic Analytics", "5 Users", "Standard Support"]}, "professional": {"price": 1299, "features": ["Advanced Analytics", "20 Users", "Priority Support", "Custom Integrations"]}, "enterprise": {"price": "custom", "features": ["Full Analytics Suite", "Unlimited Users", "24/7 Support", "Dedicated Success Manager"]}}',
    ARRAY['Real-time data processing', 'Predictive modeling', 'Custom dashboards', 'API integrations', 'Advanced visualizations', 'Anomaly detection', 'Automated reporting'],
    '{"deployment": "Cloud/On-premise", "api_rate_limit": "10000/hour", "data_retention": "5 years", "security": "SOC 2 Type II", "uptime_sla": "99.9%", "supported_formats": ["JSON", "CSV", "XML", "Parquet"]}',
    'https://docs.nexusai.com/analytics',
    'https://demo.nexusai.com/analytics'
  ),
  (
    'NexusGuard Enterprise',
    'AI-powered cybersecurity solution with advanced threat detection and automated response capabilities.',
    'Security',
    'active',
    '{"professional": {"price": 899, "features": ["Threat Detection", "Basic Response", "Email Support"]}, "enterprise": {"price": 2499, "features": ["Advanced Threat Intelligence", "Automated Response", "24/7 SOC", "Compliance Reporting"]}}',
    ARRAY['AI threat detection', 'Behavioral analysis', 'Zero-day protection', 'Automated incident response', 'Compliance reporting', 'Threat intelligence feeds', 'Real-time monitoring'],
    '{"deployment": "Cloud/Hybrid", "detection_accuracy": "99.7%", "response_time": "<1 minute", "compliance": ["SOX", "GDPR", "HIPAA"], "integrations": ["SIEM", "SOAR", "EDR"]}',
    'https://docs.nexusai.com/guard',
    'https://demo.nexusai.com/guard'
  ),
  (
    'NexusFlow Automation',
    'Intelligent workflow automation platform that streamlines business processes using AI.',
    'Automation',
    'active',
    '{"starter": {"price": 299, "features": ["Basic Workflows", "10 Automations", "Email Support"]}, "professional": {"price": 799, "features": ["Advanced Workflows", "100 Automations", "Priority Support"]}, "enterprise": {"price": 1999, "features": ["Unlimited Workflows", "Custom Integrations", "Dedicated Support"]}}',
    ARRAY['Visual workflow builder', 'AI-powered optimization', 'Multi-platform integration', 'Error handling', 'Performance analytics', 'Custom triggers', 'Approval workflows'],
    '{"max_workflows": "unlimited", "execution_time": "<5 seconds", "integrations": "500+", "uptime": "99.95%", "api_calls": "unlimited"}',
    'https://docs.nexusai.com/flow',
    'https://demo.nexusai.com/flow'
  ),
  (
    'NexusAssist AI',
    'Conversational AI assistant for customer support and internal operations with natural language processing.',
    'AI Assistant',
    'active',
    '{"basic": {"price": 199, "features": ["Basic Chatbot", "100 Conversations/month", "Email Support"]}, "professional": {"price": 599, "features": ["Advanced NLP", "1000 Conversations/month", "Priority Support"]}, "enterprise": {"price": 1499, "features": ["Custom AI Models", "Unlimited Conversations", "24/7 Support"]}}',
    ARRAY['Natural language processing', 'Multi-channel deployment', 'Knowledge base integration', 'Sentiment analysis', 'Conversation analytics', 'Custom training', 'Voice support'],
    '{"languages": "50+", "response_time": "<200ms", "accuracy": "95%", "channels": ["Web", "Mobile", "Slack", "Teams"], "training_data": "customizable"}',
    'https://docs.nexusai.com/assist',
    'https://demo.nexusai.com/assist'
  ),
  (
    'NexusVision Beta',
    'Computer vision platform for image and video analysis with deep learning capabilities.',
    'Computer Vision',
    'development',
    '{"beta": {"price": 0, "features": ["Limited Access", "Basic Models", "Community Support"]}}',
    ARRAY['Object detection', 'Image classification', 'Video analysis', 'Custom model training', 'Real-time processing', 'Edge deployment'],
    '{"accuracy": "92%", "processing_speed": "30 FPS", "supported_formats": ["JPEG", "PNG", "MP4", "AVI"], "deployment": "Cloud/Edge"}',
    'https://docs.nexusai.com/vision',
    'https://beta.nexusai.com/vision'
  );

-- Insert product analytics data
INSERT INTO product_analytics (product_id, metric_name, metric_value, date) 
SELECT 
  p.id,
  metric.name,
  (RANDOM() * 1000 + 100)::numeric,
  CURRENT_DATE - (RANDOM() * 30)::integer
FROM products p
CROSS JOIN (
  VALUES 
    ('active_users'),
    ('api_calls'),
    ('revenue'),
    ('customer_satisfaction'),
    ('uptime_percentage')
) AS metric(name)
WHERE p.status = 'active';

-- Insert more dummy demo bookings
INSERT INTO demo_bookings (name, email, company, phone, product_interest, message, preferred_date, status) VALUES
  ('Jennifer Adams', 'j.adams@globalcorp.com', 'GlobalCorp', '+1-555-0106', 'NexusAnalytics Pro', 'Need analytics for our supply chain optimization', '2025-02-01', 'pending'),
  ('Michael Chen', 'm.chen@startuptech.com', 'StartupTech', '+1-555-0107', 'NexusFlow Automation', 'Looking to automate our customer onboarding process', '2025-02-03', 'scheduled'),
  ('Lisa Rodriguez', 'l.rodriguez@healthcare.com', 'HealthCare Solutions', '+1-555-0108', 'NexusGuard Enterprise', 'Security solution for patient data protection', '2025-02-05', 'pending'),
  ('David Park', 'd.park@ecommerce.com', 'E-Commerce Plus', '+1-555-0109', 'NexusAssist AI', 'AI chatbot for customer service automation', '2025-02-07', 'completed'),
  ('Amanda Foster', 'a.foster@manufacturing.com', 'Manufacturing Inc', '+1-555-0110', 'NexusVision Beta', 'Computer vision for quality control', '2025-02-10', 'pending'),
  ('Ryan Thompson', 'r.thompson@logistics.com', 'Logistics Pro', '+1-555-0111', 'NexusAnalytics Pro', 'Predictive analytics for route optimization', '2025-02-12', 'scheduled'),
  ('Sophie Williams', 's.williams@retail.com', 'Retail Chain', '+1-555-0112', 'NexusFlow Automation', 'Inventory management automation', '2025-02-15', 'pending');

-- Insert more dummy general applications
INSERT INTO general_applications (name, email, phone, resume_url, cover_letter, portfolio_url, linkedin_url, status) VALUES
  ('James Wilson', 'james.wilson@email.com', '+1-555-0206', 'https://drive.google.com/file/d/6pqr678', 'Senior software engineer with expertise in distributed systems and microservices architecture. Passionate about building scalable AI solutions...', 'https://jameswilson.dev', 'https://linkedin.com/in/jameswilson', 'shortlisted'),
  ('Maria Garcia', 'maria.garcia@email.com', '+1-555-0207', 'https://drive.google.com/file/d/7stu901', 'Machine learning researcher with PhD in Computer Science. Published 15+ papers in top-tier conferences...', NULL, 'https://linkedin.com/in/mariagarcia', 'pending'),
  ('Alex Kim', 'alex.kim@email.com', '+1-555-0208', 'https://drive.google.com/file/d/8vwx234', 'DevOps engineer specializing in cloud infrastructure and CI/CD pipelines. Experience with AWS, Kubernetes, and Docker...', 'https://alexkim.cloud', 'https://linkedin.com/in/alexkim', 'shortlisted'),
  ('Rachel Green', 'rachel.green@email.com', '+1-555-0209', 'https://drive.google.com/file/d/9yzab567', 'Business analyst with 7+ years experience in AI product strategy and market analysis...', 'https://rachelgreen.biz', 'https://linkedin.com/in/rachelgreen', 'rejected'),
  ('Tom Anderson', 'tom.anderson@email.com', '+1-555-0210', 'https://drive.google.com/file/d/10cdef890', 'Full-stack developer with expertise in React, Node.js, and Python. Built several AI-powered web applications...', 'https://tomanderson.portfolio.com', 'https://linkedin.com/in/tomanderson', 'pending'),
  ('Nina Patel', 'nina.patel@email.com', '+1-555-0211', 'https://drive.google.com/file/d/11ghij123', 'Data engineer with experience in big data processing and real-time analytics. Skilled in Apache Spark, Kafka, and Hadoop...', NULL, 'https://linkedin.com/in/ninapatel', 'shortlisted'),
  ('Chris Taylor', 'chris.taylor@email.com', '+1-555-0212', 'https://drive.google.com/file/d/12klmn456', 'QA engineer specializing in automated testing for AI/ML systems. Experience with test automation frameworks...', 'https://christaylor.qa', 'https://linkedin.com/in/christaylor', 'pending');

-- Insert more scheduled messages
INSERT INTO scheduled_messages (subject, content, recipient_type, scheduled_for, created_by) VALUES
  ('Weekly Product Update', 'This week''s product updates and new features...', 'all', '2025-01-20 09:00:00', '550e8400-e29b-41d4-a716-446655440001'),
  ('Demo Follow-up', 'Thank you for attending our demo session...', 'demo_requesters', '2025-01-21 14:00:00', '550e8400-e29b-41d4-a716-446655440001'),
  ('Job Application Status', 'Updates on your recent job application...', 'job_applicants', '2025-01-22 10:00:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('Monthly Newsletter', 'Your monthly AI insights and industry trends...', 'newsletter', '2025-02-01 08:00:00', '550e8400-e29b-41d4-a716-446655440001');