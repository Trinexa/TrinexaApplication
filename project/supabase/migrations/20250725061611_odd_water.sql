/*
  # Email Management System

  1. New Tables
    - `email_campaigns` - Store email campaigns with targeting and analytics
    - `email_templates` - Reusable email templates with variables
    - `email_recipients` - Track who receives emails
    - `email_analytics` - Track email performance metrics
    - `email_schedules` - Manage scheduled email sends
    - `email_lists` - Manage recipient lists and segments

  2. Security
    - Enable RLS on all email tables
    - Add policies for admin access and user privacy

  3. Functions
    - Email sending and tracking functions
    - Analytics calculation functions
*/

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  template_id uuid,
  sender_name text DEFAULT 'Trinexa Team',
  sender_email text DEFAULT 'noreply@trinexa.com',
  target_audience text NOT NULL CHECK (target_audience IN ('all_users', 'customers', 'prospects', 'admin_users', 'demo_requesters', 'job_applicants', 'newsletter_subscribers', 'custom_list')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  total_recipients integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  bounced_count integer DEFAULT 0,
  unsubscribed_count integer DEFAULT 0,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
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
  updated_at timestamptz DEFAULT now()
);

-- Email Recipients Table
CREATE TABLE IF NOT EXISTS email_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  recipient_name text,
  recipient_type text NOT NULL,
  recipient_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  unsubscribed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Email Analytics Table
CREATE TABLE IF NOT EXISTS email_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES email_recipients(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained')),
  event_data jsonb DEFAULT '{}',
  user_agent text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Email Lists Table
CREATE TABLE IF NOT EXISTS email_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  list_type text DEFAULT 'custom' CHECK (list_type IN ('custom', 'dynamic', 'imported')),
  criteria jsonb DEFAULT '{}',
  subscriber_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email List Subscribers Table
CREATE TABLE IF NOT EXISTS email_list_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES email_lists(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  metadata jsonb DEFAULT '{}',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  is_active boolean DEFAULT true,
  UNIQUE(list_id, email)
);

-- Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  preferences jsonb DEFAULT '{"marketing": true, "product_updates": true, "newsletters": true}',
  source text DEFAULT 'website',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  is_active boolean DEFAULT true,
  verification_token text,
  verified_at timestamptz
);

-- Enable RLS
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_list_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using auth.uid() for Supabase compatibility)
CREATE POLICY "Allow admin users to manage email campaigns"
  ON email_campaigns
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY "Allow admin users to manage email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY "Allow admin users to view email recipients"
  ON email_recipients
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY "Allow admin users to view email analytics"
  ON email_analytics
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY "Allow admin users to manage email lists"
  ON email_lists
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY "Allow admin users to manage list subscribers"
  ON email_list_subscribers
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY "Allow public newsletter subscriptions"
  ON newsletter_subscriptions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to manage own newsletter subscription"
  ON newsletter_subscriptions
  FOR ALL
  TO public
  USING (true);

-- Functions for email management
CREATE OR REPLACE FUNCTION get_email_recipients(target_audience text)
RETURNS TABLE(email text, name text, recipient_type text, recipient_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CASE target_audience
    WHEN 'all_users' THEN
      RETURN QUERY
      SELECT c.email, c.name, 'customer'::text, c.id
      FROM customers c
      WHERE c.email IS NOT NULL
      UNION ALL
      SELECT au.email, au.email, 'admin'::text, au.id
      FROM admin_users au;
      
    WHEN 'customers' THEN
      RETURN QUERY
      SELECT c.email, c.name, 'customer'::text, c.id
      FROM customers c
      WHERE c.email IS NOT NULL;
      
    WHEN 'prospects' THEN
      RETURN QUERY
      SELECT db.email, db.name, 'prospect'::text, db.id
      FROM demo_bookings db
      WHERE db.email IS NOT NULL
      AND db.id NOT IN (SELECT DISTINCT customer_id FROM customers WHERE customer_id IS NOT NULL);
      
    WHEN 'admin_users' THEN
      RETURN QUERY
      SELECT au.email, au.email, 'admin'::text, au.id
      FROM admin_users au;
      
    WHEN 'demo_requesters' THEN
      RETURN QUERY
      SELECT db.email, db.name, 'demo_requester'::text, db.id
      FROM demo_bookings db
      WHERE db.email IS NOT NULL;
      
    WHEN 'job_applicants' THEN
      RETURN QUERY
      SELECT ga.email, ga.name, 'job_applicant'::text, ga.id
      FROM general_applications ga
      WHERE ga.email IS NOT NULL;
      
    WHEN 'newsletter_subscribers' THEN
      RETURN QUERY
      SELECT ns.email, ns.name, 'newsletter_subscriber'::text, ns.id
      FROM newsletter_subscriptions ns
      WHERE ns.is_active = true;
      
    ELSE
      -- Return empty for custom lists (handled separately)
      RETURN;
  END CASE;
END;
$$;

-- Function to update campaign analytics
CREATE OR REPLACE FUNCTION update_campaign_analytics(campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE email_campaigns
  SET 
    total_recipients = (
      SELECT COUNT(*) FROM email_recipients 
      WHERE email_recipients.campaign_id = update_campaign_analytics.campaign_id
    ),
    delivered_count = (
      SELECT COUNT(*) FROM email_recipients 
      WHERE email_recipients.campaign_id = update_campaign_analytics.campaign_id 
      AND status IN ('delivered', 'opened', 'clicked')
    ),
    opened_count = (
      SELECT COUNT(*) FROM email_recipients 
      WHERE email_recipients.campaign_id = update_campaign_analytics.campaign_id 
      AND status IN ('opened', 'clicked')
    ),
    clicked_count = (
      SELECT COUNT(*) FROM email_recipients 
      WHERE email_recipients.campaign_id = update_campaign_analytics.campaign_id 
      AND status = 'clicked'
    ),
    bounced_count = (
      SELECT COUNT(*) FROM email_recipients 
      WHERE email_recipients.campaign_id = update_campaign_analytics.campaign_id 
      AND status = 'bounced'
    ),
    unsubscribed_count = (
      SELECT COUNT(*) FROM email_recipients 
      WHERE email_recipients.campaign_id = update_campaign_analytics.campaign_id 
      AND status = 'unsubscribed'
    ),
    updated_at = now()
  WHERE id = campaign_id;
END;
$$;

-- Insert sample email templates
INSERT INTO email_templates (name, category, subject, content, variables, created_by) VALUES
('Welcome Email', 'welcome', 'Welcome to Trinexa - Your AI Journey Begins!', 
'Hi {name},

Welcome to Trinexa! We''re excited to have you join our community of forward-thinking businesses leveraging AI to transform their operations.

Here''s what you can expect:
• Access to cutting-edge AI solutions
• Dedicated customer support
• Regular product updates and insights
• Exclusive resources and documentation

Get started by exploring your dashboard: {dashboard_url}

Best regards,
The Trinexa Team', 
ARRAY['name', 'dashboard_url'], 
(SELECT id FROM admin_users LIMIT 1)),

('Product Update', 'newsletter', 'New Features Available in {product_name}', 
'Hi {name},

We''re excited to announce new features in {product_name} that will help you achieve even better results.

What''s New:
{feature_list}

These updates are available now in your dashboard. 

Questions? Our support team is here to help: support@trinexa.com

Best regards,
The Trinexa Team', 
ARRAY['name', 'product_name', 'feature_list'], 
(SELECT id FROM admin_users LIMIT 1)),

('Demo Follow-up', 'transactional', 'Thank you for your demo session', 
'Hi {name},

Thank you for taking the time to explore {product_name} with us today. We hope you found the demonstration valuable and informative.

Next Steps:
• Review the demo recording: {recording_url}
• Access trial account: {trial_url}
• Schedule follow-up call: {calendar_url}

Our team is here to answer any questions you may have.

Best regards,
{sales_rep_name}
Trinexa Sales Team', 
ARRAY['name', 'product_name', 'recording_url', 'trial_url', 'calendar_url', 'sales_rep_name'], 
(SELECT id FROM admin_users LIMIT 1));

-- Insert sample newsletter subscriptions
INSERT INTO newsletter_subscriptions (email, name, verified_at) VALUES
('john.doe@example.com', 'John Doe', now()),
('jane.smith@techcorp.com', 'Jane Smith', now()),
('mike.johnson@innovate.ai', 'Mike Johnson', now());