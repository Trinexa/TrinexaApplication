/*
  # Add admin functionality tables

  1. New Tables
    - `admin_users` - Store admin user information
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `role` (text)
      - `created_at` (timestamp)
      
    - `page_content` - Store editable page content
      - `id` (uuid, primary key)
      - `page_id` (text)
      - `section_id` (text)
      - `content` (jsonb)
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references admin_users)
      
    - `admin_messages` - Store messages sent by admins
      - `id` (uuid, primary key)
      - `subject` (text)
      - `content` (text)
      - `recipient_type` (text)
      - `recipient_ids` (uuid[])
      - `sent_at` (timestamp)
      - `sent_by` (uuid, references admin_users)

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'content_admin', 'recruitment_admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to read admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Page content table
CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id text NOT NULL,
  section_id text NOT NULL,
  content jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES admin_users(id),
  UNIQUE(page_id, section_id)
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to page_content"
  ON page_content
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin users to manage page_content"
  ON page_content
  USING (auth.uid() IN (
    SELECT id FROM admin_users 
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Admin messages table
CREATE TABLE IF NOT EXISTS admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  content text NOT NULL,
  recipient_type text NOT NULL,
  recipient_ids uuid[] DEFAULT '{}',
  sent_at timestamptz DEFAULT now(),
  sent_by uuid REFERENCES admin_users(id)
);

ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin users to manage admin_messages"
  ON admin_messages
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin')
  ));