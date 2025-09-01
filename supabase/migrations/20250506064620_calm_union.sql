/*
  # Initial schema setup for NexusAI

  1. New Tables
    - `services` - Core services/products offered
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `icon` (text)
      - `features` (text[])
      - `created_at` (timestamp)
      
    - `team_members` - Leadership team information
      - `id` (uuid, primary key)
      - `name` (text)
      - `position` (text)
      - `bio` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
      
    - `careers` - Job openings
      - `id` (uuid, primary key)
      - `title` (text)
      - `department` (text)
      - `location` (text)
      - `type` (text)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin access
*/

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to services"
  ON services
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin full access to services"
  ON services
  USING (auth.role() = 'authenticated');

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  bio text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to team_members"
  ON team_members
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin full access to team_members"
  ON team_members
  USING (auth.role() = 'authenticated');

-- Careers table
CREATE TABLE IF NOT EXISTS careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE careers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to careers"
  ON careers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin full access to careers"
  ON careers
  USING (auth.role() = 'authenticated');