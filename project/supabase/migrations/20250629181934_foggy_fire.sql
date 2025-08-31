/*
  # Enterprise Features Migration

  1. New Tables
    - `customers` - Customer accounts and subscription info
    - `subscriptions` - Subscription management
    - `api_keys` - API key management with permissions
    - `support_tickets` - Support ticket system
    - `ticket_messages` - Support ticket conversations
    - `resources` - Help center resources and downloads
    - `usage_analytics` - Customer usage tracking
    - `revenue_analytics` - Business revenue metrics
    - `customer_growth_analytics` - Customer growth tracking
    - `integrations` - Third-party integrations
    - `webhooks` - Webhook management
    - `campaigns` - Marketing campaigns
    - `events` - Event management
    - `event_registrations` - Event registration tracking
    - `workflow_templates` - Automation templates
    - `audit_logs` - Security audit logging
    - `notifications` - Multi-channel notifications
    - `forum_posts` - Community forum posts
    - `forum_replies` - Forum post replies
    - `chatbot_conversations` - Chatbot sessions
    - `chat_messages` - Chat message history

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies with proper type casting
*/

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  company text NOT NULL,
  subscription_plan text DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
  subscription_status text DEFAULT 'trial' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trial')),
  trial_end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  total_usage bigint DEFAULT 0,
  monthly_usage bigint DEFAULT 0
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow customers to read own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Allow admin users to manage customers"
  ON customers
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trial')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  trial_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow customers to read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Allow admin users to manage subscriptions"
  ON subscriptions
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  key text UNIQUE NOT NULL,
  permissions text[] DEFAULT '{}',
  rate_limit integer DEFAULT 1000,
  usage_count bigint DEFAULT 0,
  last_used timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow customers to manage own api keys"
  ON api_keys
  USING (customer_id = auth.uid());

CREATE POLICY "Allow admin users to manage api keys"
  ON api_keys
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category text NOT NULL,
  assigned_to uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow customers to manage own tickets"
  ON support_tickets
  USING (customer_id = auth.uid());

CREATE POLICY "Allow admin users to manage all tickets"
  ON support_tickets
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Ticket Messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  message text NOT NULL,
  attachments text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ticket participants to read messages"
  ON ticket_messages
  FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE customer_id = auth.uid() 
      OR auth.uid() IN (SELECT id FROM admin_users)
    )
  );

CREATE POLICY "Allow ticket participants to create messages"
  ON ticket_messages
  FOR INSERT
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE customer_id = auth.uid() 
      OR auth.uid() IN (SELECT id FROM admin_users)
    )
  );

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('document', 'video', 'template', 'guide')),
  category text NOT NULL,
  file_url text,
  content text,
  access_level text DEFAULT 'public' CHECK (access_level IN ('public', 'customer', 'premium')),
  download_count bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to public resources"
  ON resources
  FOR SELECT
  TO public
  USING (access_level = 'public');

CREATE POLICY "Allow customers to read customer resources"
  ON resources
  FOR SELECT
  TO authenticated
  USING (access_level IN ('public', 'customer'));

CREATE POLICY "Allow admin users to manage resources"
  ON resources
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Usage Analytics table
CREATE TABLE IF NOT EXISTS usage_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow customers to read own analytics"
  ON usage_analytics
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Allow admin users to manage analytics"
  ON usage_analytics
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Revenue Analytics table
CREATE TABLE IF NOT EXISTS revenue_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  revenue numeric NOT NULL,
  mrr numeric NOT NULL,
  arr numeric,
  new_customers integer DEFAULT 0,
  churned_customers integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to read revenue analytics"
  ON revenue_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Customer Growth Analytics table
CREATE TABLE IF NOT EXISTS customer_growth_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  new_customers integer DEFAULT 0,
  churned integer DEFAULT 0,
  net_growth integer DEFAULT 0,
  total_customers integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer_growth_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to read growth analytics"
  ON customer_growth_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('webhook', 'api', 'oauth')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  configuration jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to manage integrations"
  ON integrations
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL,
  secret text NOT NULL,
  is_active boolean DEFAULT true,
  last_triggered timestamptz,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow customers to manage own webhooks"
  ON webhooks
  USING (customer_id = auth.uid());

CREATE POLICY "Allow admin users to manage webhooks"
  ON webhooks
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'paused')),
  subject text,
  content text NOT NULL,
  target_audience text NOT NULL,
  scheduled_at timestamptz,
  sent_count integer DEFAULT 0,
  open_rate numeric DEFAULT 0,
  click_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to manage campaigns"
  ON campaigns
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('webinar', 'workshop', 'conference', 'demo')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  max_attendees integer,
  registered_count integer DEFAULT 0,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  meeting_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to events"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin users to manage events"
  ON events
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Event Registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  registered_at timestamptz DEFAULT now(),
  attended boolean DEFAULT false,
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own registrations"
  ON event_registrations
  USING (user_id = auth.uid());

CREATE POLICY "Allow admin users to manage registrations"
  ON event_registrations
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Workflow Templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to manage workflow templates"
  ON workflow_templates
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Allow users to create audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  channel text DEFAULT 'in_app' CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow admin users to create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- Forum Posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  is_solved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to forum posts"
  ON forum_posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to create posts"
  ON forum_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update own posts"
  ON forum_posts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Forum Replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  is_solution boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to forum replies"
  ON forum_replies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to create replies"
  ON forum_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update own replies"
  ON forum_replies
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Chatbot Conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own conversations"
  ON chatbot_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Allow users to create conversations"
  ON chatbot_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admin users to read all conversations"
  ON chatbot_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'bot', 'agent')),
  message text NOT NULL,
  intent text,
  confidence numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow conversation participants to read messages"
  ON chat_messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chatbot_conversations 
      WHERE user_id = auth.uid() 
      OR user_id IS NULL
      OR auth.uid() IN (SELECT id FROM admin_users)
    )
  );

CREATE POLICY "Allow conversation participants to create messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM chatbot_conversations 
      WHERE user_id = auth.uid() 
      OR user_id IS NULL
      OR auth.uid() IN (SELECT id FROM admin_users)
    )
  );

-- Create functions for business metrics
CREATE OR REPLACE FUNCTION get_business_metrics()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_revenue', COALESCE(SUM(revenue), 0),
    'monthly_recurring_revenue', COALESCE((SELECT revenue FROM revenue_analytics ORDER BY date DESC LIMIT 1), 0),
    'annual_recurring_revenue', COALESCE(SUM(revenue) * 12, 0),
    'customer_count', (SELECT COUNT(*) FROM customers WHERE subscription_status = 'active'),
    'churn_rate', 2.3,
    'growth_rate', 15.7,
    'average_revenue_per_user', COALESCE(AVG(revenue), 0),
    'customer_lifetime_value', COALESCE(AVG(revenue) * 12, 0)
  ) INTO result
  FROM revenue_analytics
  WHERE date >= CURRENT_DATE - INTERVAL '12 months';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment API usage
CREATE OR REPLACE FUNCTION increment_api_usage(key_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE api_keys 
  SET usage_count = usage_count + 1,
      last_used = now()
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(resource_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE resources 
  SET download_count = download_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert dummy customers
INSERT INTO customers (id, name, email, company, subscription_plan, subscription_status, total_usage, monthly_usage) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john@techcorp.com', 'TechCorp Inc.', 'professional', 'active', 125000, 8500),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'sarah@innovate.com', 'InnovateAI Ltd.', 'enterprise', 'active', 250000, 15000),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mike Wilson', 'mike@dataflow.com', 'DataFlow Systems', 'starter', 'trial', 5000, 2500),
  ('550e8400-e29b-41d4-a716-446655440004', 'Emily Davis', 'emily@retailnext.com', 'RetailNext', 'professional', 'active', 95000, 6200),
  ('550e8400-e29b-41d4-a716-446655440005', 'Robert Brown', 'robert@fintech.com', 'FinTech Solutions', 'enterprise', 'active', 180000, 12000)
ON CONFLICT (email) DO NOTHING;

-- Insert dummy API keys
INSERT INTO api_keys (customer_id, name, key, permissions, rate_limit, usage_count) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Production API', 'sk_live_abc123def456', ARRAY['read', 'write'], 5000, 2450),
  ('550e8400-e29b-41d4-a716-446655440001', 'Development API', 'sk_test_xyz789uvw012', ARRAY['read'], 1000, 890),
  ('550e8400-e29b-41d4-a716-446655440002', 'Main API Key', 'sk_live_enterprise123', ARRAY['read', 'write', 'admin'], 10000, 5200),
  ('550e8400-e29b-41d4-a716-446655440003', 'Trial API', 'sk_test_trial456', ARRAY['read'], 500, 125)
ON CONFLICT (key) DO NOTHING;

-- Insert dummy support tickets
INSERT INTO support_tickets (customer_id, subject, description, status, priority, category) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'API Rate Limit Issue', 'We are hitting rate limits frequently during peak hours', 'open', 'high', 'technical'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Integration Help Needed', 'Need assistance with webhook setup for our CRM', 'in_progress', 'medium', 'integration'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Billing Question', 'Question about upgrading from trial to paid plan', 'resolved', 'low', 'billing'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Feature Request', 'Would like to request a new API endpoint for analytics', 'open', 'medium', 'feature_request')
ON CONFLICT DO NOTHING;

-- Insert dummy resources
INSERT INTO resources (title, description, type, category, access_level, download_count) VALUES
  ('API Getting Started Guide', 'Complete guide to getting started with our API', 'document', 'api', 'public', 1250),
  ('Integration Best Practices', 'Best practices for integrating with our platform', 'document', 'integration', 'customer', 890),
  ('Video: API Authentication', 'Learn how to authenticate with our API', 'video', 'api', 'public', 2100),
  ('Webhook Setup Template', 'Template for setting up webhooks', 'template', 'webhooks', 'customer', 650),
  ('Security Implementation Guide', 'Guide for implementing security best practices', 'guide', 'security', 'premium', 420),
  ('SDK Documentation', 'Complete SDK documentation and examples', 'document', 'sdk', 'customer', 1800),
  ('Video: Advanced Features', 'Deep dive into advanced platform features', 'video', 'advanced', 'premium', 320),
  ('Error Handling Template', 'Template for proper error handling', 'template', 'development', 'customer', 540)
ON CONFLICT DO NOTHING;

-- Insert dummy usage analytics
INSERT INTO usage_analytics (customer_id, metric_name, metric_value, date) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'api_calls', 8500, CURRENT_DATE),
  ('550e8400-e29b-41d4-a716-446655440001', 'data_processed_gb', 125.5, CURRENT_DATE),
  ('550e8400-e29b-41d4-a716-446655440002', 'api_calls', 15000, CURRENT_DATE),
  ('550e8400-e29b-41d4-a716-446655440002', 'data_processed_gb', 280.2, CURRENT_DATE),
  ('550e8400-e29b-41d4-a716-446655440003', 'api_calls', 2500, CURRENT_DATE),
  ('550e8400-e29b-41d4-a716-446655440003', 'data_processed_gb', 45.8, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Insert dummy revenue analytics
INSERT INTO revenue_analytics (date, revenue, mrr, new_customers, churned_customers) VALUES
  ('2024-01-01', 145000, 142000, 12, 2),
  ('2024-02-01', 152000, 148000, 15, 3),
  ('2024-03-01', 168000, 155000, 18, 1),
  ('2024-04-01', 175000, 162000, 14, 2),
  ('2024-05-01', 182000, 168000, 16, 1),
  ('2024-06-01', 195000, 175000, 20, 3),
  ('2024-07-01', 205000, 182000, 17, 2),
  ('2024-08-01', 218000, 188000, 19, 1),
  ('2024-09-01', 225000, 195000, 15, 2),
  ('2024-10-01', 235000, 202000, 18, 1),
  ('2024-11-01', 248000, 210000, 22, 3),
  ('2024-12-01', 265000, 218000, 25, 2)
ON CONFLICT DO NOTHING;

-- Insert dummy customer growth analytics
INSERT INTO customer_growth_analytics (date, new_customers, churned, net_growth, total_customers) VALUES
  ('2024-01-01', 12, 2, 10, 150),
  ('2024-02-01', 15, 3, 12, 162),
  ('2024-03-01', 18, 1, 17, 179),
  ('2024-04-01', 14, 2, 12, 191),
  ('2024-05-01', 16, 1, 15, 206),
  ('2024-06-01', 20, 3, 17, 223),
  ('2024-07-01', 17, 2, 15, 238),
  ('2024-08-01', 19, 1, 18, 256),
  ('2024-09-01', 15, 2, 13, 269),
  ('2024-10-01', 18, 1, 17, 286),
  ('2024-11-01', 22, 3, 19, 305),
  ('2024-12-01', 25, 2, 23, 328)
ON CONFLICT DO NOTHING;

-- Insert dummy webhooks
INSERT INTO webhooks (customer_id, url, events, secret) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'https://techcorp.com/webhooks/trinexa', ARRAY['user.created', 'payment.completed'], 'whsec_abc123'),
  ('550e8400-e29b-41d4-a716-446655440002', 'https://innovate.com/api/webhooks', ARRAY['user.created', 'user.updated', 'payment.completed'], 'whsec_xyz789')
ON CONFLICT DO NOTHING;

-- Insert dummy forum posts
INSERT INTO forum_posts (user_id, title, content, category, tags, upvotes, reply_count) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Best practices for API rate limiting', 'What are the recommended approaches for handling rate limits in production?', 'api', ARRAY['api', 'rate-limiting', 'best-practices'], 15, 8),
  ('550e8400-e29b-41d4-a716-446655440002', 'Webhook retry mechanism', 'How does the webhook retry system work when our endpoint is down?', 'webhooks', ARRAY['webhooks', 'reliability'], 12, 5),
  ('550e8400-e29b-41d4-a716-446655440003', 'SDK vs REST API', 'When should I use the SDK versus direct REST API calls?', 'general', ARRAY['sdk', 'api', 'integration'], 8, 3)
ON CONFLICT DO NOTHING;

-- Insert dummy events
INSERT INTO events (title, description, type, start_date, end_date, max_attendees, registered_count) VALUES
  ('API Best Practices Webinar', 'Learn best practices for API integration and optimization', 'webinar', '2025-02-15 14:00:00', '2025-02-15 15:30:00', 500, 245),
  ('Advanced Features Workshop', 'Hands-on workshop covering advanced platform features', 'workshop', '2025-02-20 10:00:00', '2025-02-20 16:00:00', 50, 38),
  ('Product Demo Session', 'Live demonstration of new product features', 'demo', '2025-02-25 13:00:00', '2025-02-25 14:00:00', 200, 156)
ON CONFLICT DO NOTHING;

-- Insert dummy campaigns
INSERT INTO campaigns (name, type, status, subject, content, target_audience, sent_count, open_rate, click_rate) VALUES
  ('Welcome Series', 'email', 'running', 'Welcome to Trinexa!', 'Thank you for joining Trinexa. Here is how to get started...', 'new_customers', 1250, 0.68, 0.24),
  ('Feature Announcement', 'email', 'completed', 'New API Features Available', 'We are excited to announce new API features...', 'all_customers', 3200, 0.72, 0.18),
  ('Trial Conversion', 'email', 'running', 'Upgrade Your Trial', 'Your trial is ending soon. Upgrade to continue...', 'trial_users', 450, 0.58, 0.32)
ON CONFLICT DO NOTHING;

-- Insert dummy workflow templates
INSERT INTO workflow_templates (name, description, category, steps) VALUES
  ('Customer Onboarding', 'Automated workflow for new customer onboarding', 'onboarding', '[{"step": "send_welcome_email", "delay": 0}, {"step": "create_api_key", "delay": 3600}, {"step": "send_getting_started_guide", "delay": 86400}]'),
  ('Trial Conversion', 'Workflow to convert trial users to paid customers', 'conversion', '[{"step": "send_trial_reminder", "delay": 604800}, {"step": "offer_discount", "delay": 1209600}, {"step": "final_reminder", "delay": 1728000}]'),
  ('Support Escalation', 'Automated escalation for high-priority support tickets', 'support', '[{"step": "assign_to_senior", "delay": 3600}, {"step": "notify_manager", "delay": 7200}, {"step": "escalate_to_director", "delay": 14400}]')
ON CONFLICT DO NOTHING;