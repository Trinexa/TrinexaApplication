/*
  # Add job applications table

  1. New Tables
    - `job_applications` - Store applications for specific job positions
      - `id` (uuid, primary key)
      - `job_position_id` (uuid, foreign key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `resume_url` (text)
      - `cover_letter` (text)
      - `portfolio_url` (text, optional)
      - `linkedin_url` (text, optional)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for public insert and admin read access
*/

CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_position_id uuid NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  resume_url text NOT NULL,
  cover_letter text NOT NULL,
  portfolio_url text,
  linkedin_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected', 'interviewed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Allow public to create job applications
CREATE POLICY "Allow public to create job applications"
  ON job_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users (admins) to read job applications
CREATE POLICY "Allow authenticated users to read job applications"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update job applications
CREATE POLICY "Allow authenticated users to update job applications"
  ON job_applications
  FOR UPDATE
  TO authenticated
  USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_job_applications_position_id ON job_applications(job_position_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON job_applications(created_at);
