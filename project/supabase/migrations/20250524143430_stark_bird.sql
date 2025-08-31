/*
  # Add general applications table

  1. New Tables
    - `general_applications` - Store general job applications
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `resume_url` (text)
      - `cover_letter` (text)
      - `portfolio_url` (text, optional)
      - `linkedin_url` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for public insert and admin read access
*/

CREATE TABLE IF NOT EXISTS general_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  resume_url text NOT NULL,
  cover_letter text NOT NULL,
  portfolio_url text,
  linkedin_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE general_applications ENABLE ROW LEVEL SECURITY;

-- Allow public to create applications
CREATE POLICY "Allow public to create general applications"
  ON general_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users (admins) to read applications
CREATE POLICY "Allow authenticated users to read general applications"
  ON general_applications
  FOR SELECT
  TO authenticated
  USING (true);