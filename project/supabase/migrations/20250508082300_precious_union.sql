/*
  # Create demo bookings table

  1. New Tables
    - `demo_bookings` - Store demo booking requests
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `company` (text)
      - `phone` (text)
      - `product_interest` (text)
      - `message` (text)
      - `preferred_date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for public insert and admin read access
*/

CREATE TABLE IF NOT EXISTS demo_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  phone text NOT NULL,
  product_interest text NOT NULL,
  message text,
  preferred_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;

-- Allow public to create demo bookings
CREATE POLICY "Allow public to create demo bookings"
  ON demo_bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users (admins) to read demo bookings
CREATE POLICY "Allow authenticated users to read demo bookings"
  ON demo_bookings
  FOR SELECT
  TO authenticated
  USING (true);