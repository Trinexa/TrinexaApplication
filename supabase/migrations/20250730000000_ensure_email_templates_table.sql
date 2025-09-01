/*
  # Ensure email_templates table exists
  
  This migration ensures that the email_templates table exists before
  inserting default templates. It's a safety measure to prevent errors
  when the table creation migration hasn't run yet.
*/

-- Create admin_users table if it doesn't exist (dependency for email_templates)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  name text,
  role text DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_templates table if it doesn't exist
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
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, category)
);

-- Enable RLS on email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for email_templates
CREATE POLICY "email_templates_select_policy"
  ON email_templates
  FOR SELECT
  USING (true);

CREATE POLICY "email_templates_insert_policy"
  ON email_templates
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "email_templates_update_policy"
  ON email_templates
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "email_templates_delete_policy"
  ON email_templates
  FOR DELETE
  USING (true);
