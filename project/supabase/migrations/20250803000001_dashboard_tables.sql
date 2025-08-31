/*
  # Dashboard Required Tables

  1. New Tables for Dashboard
    - `demo_bookings` - Demo requests management
    - `support_tickets` - Support tickets system  
    - `general_applications` - Job applications

  2. Update existing newsletter_subscriptions
    - Add created_at column for dashboard queries

  3. Add indexes for performance
*/

-- Demo Bookings Table
CREATE TABLE IF NOT EXISTS demo_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  product_interest text,
  preferred_date timestamptz,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  assigned_to uuid,
  demo_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fix phone column constraint if table already exists
DO $$ 
BEGIN
    -- Drop NOT NULL constraint on phone if it exists
    BEGIN
        ALTER TABLE demo_bookings ALTER COLUMN phone DROP NOT NULL;
    EXCEPTION
        WHEN others THEN 
            -- Ignore error if constraint doesn't exist
            NULL;
    END;
    
    -- Drop NOT NULL constraint on preferred_date if it exists
    BEGIN
        ALTER TABLE demo_bookings ALTER COLUMN preferred_date DROP NOT NULL;
    EXCEPTION
        WHEN others THEN 
            -- Ignore error if constraint doesn't exist
            NULL;
    END;
    
    -- Drop NOT NULL constraint on message if it exists
    BEGIN
        ALTER TABLE demo_bookings ALTER COLUMN message DROP NOT NULL;
    EXCEPTION
        WHEN others THEN 
            -- Ignore error if constraint doesn't exist
            NULL;
    END;
END $$;

-- Support Tickets Table already exists from previous migration
-- Just add indexes for dashboard performance

-- General Applications Table already exists from previous migration
-- Just add indexes for dashboard performance

-- Add created_at column to newsletter_subscriptions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'newsletter_subscriptions' AND column_name = 'created_at') THEN
        ALTER TABLE newsletter_subscriptions ADD COLUMN created_at timestamptz DEFAULT subscribed_at;
    END IF;
END $$;

-- Enable RLS on new tables (support_tickets and general_applications already have RLS enabled)
ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access to create records
CREATE POLICY "Allow public demo booking creation"
  ON demo_bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow admin access to demo bookings"
  ON demo_bookings
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Support tickets policies already exist from previous migration

-- General applications policies already exist from previous migration

-- Add unique constraints for conflict resolution
DO $$ 
BEGIN
    -- Add unique constraint on demo_bookings.email if it doesn't exist
    BEGIN
        ALTER TABLE demo_bookings ADD CONSTRAINT demo_bookings_email_unique UNIQUE (email);
    EXCEPTION
        WHEN duplicate_object THEN 
            -- Constraint already exists
            NULL;
    END;
END $$;

-- Create indexes for dashboard performance
CREATE INDEX IF NOT EXISTS idx_demo_bookings_created_at ON demo_bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_status ON demo_bookings(status);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_product_interest ON demo_bookings(product_interest);

CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_is_active ON newsletter_subscriptions(is_active);

CREATE INDEX IF NOT EXISTS idx_support_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets(status);

CREATE INDEX IF NOT EXISTS idx_applications_created_at ON general_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_status ON general_applications(status);

-- Insert sample data for dashboard testing
INSERT INTO demo_bookings (name, email, company, phone, product_interest, preferred_date, status, created_at) 
SELECT * FROM (VALUES
('John Smith', 'john@techcorp.com', 'TechCorp Inc', '+1-555-0101', 'CRM Software', now() + interval '3 days', 'completed', now() - interval '2 days'),
('Sarah Johnson', 'sarah@startup.io', 'StartUp Solutions', '+1-555-0102', 'Analytics Platform', now() + interval '5 days', 'scheduled', now() - interval '1 day'),
('Mike Wilson', 'mike@enterprise.com', 'Enterprise Ltd', '+1-555-0103', 'Project Management', now() + interval '1 week', 'pending', now() - interval '3 hours'),
('Lisa Chen', 'lisa@innovate.com', 'InnovateX', '+1-555-0104', 'E-commerce Solution', now() - interval '1 day', 'completed', now() - interval '5 days'),
('David Brown', 'david@global.com', 'Global Systems', '+1-555-0105', 'CRM Software', now() + interval '2 days', 'pending', now() - interval '1 hour')
) AS v(name, email, company, phone, product_interest, preferred_date, status, created_at)
WHERE NOT EXISTS (SELECT 1 FROM demo_bookings WHERE demo_bookings.email = v.email);

INSERT INTO support_tickets (subject, description, category, status, created_at) 
SELECT * FROM (VALUES
('Login Issues', 'Cannot access my account', 'technical', 'open', now() - interval '2 hours'),
('Feature Request', 'Need new reporting feature', 'feature', 'in_progress', now() - interval '1 day'),
('Billing Question', 'Question about my invoice', 'billing', 'resolved', now() - interval '3 days'),
('Bug Report', 'Found a bug in the system', 'technical', 'open', now() - interval '6 hours')
) AS v(subject, description, category, status, created_at)
WHERE NOT EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.subject = v.subject);

INSERT INTO general_applications (name, email, phone, resume_url, cover_letter, created_at) 
SELECT * FROM (VALUES
('Robert Green', 'robert@resume.com', '+1-555-0201', 'https://example.com/resume1.pdf', 'Experienced software developer seeking new opportunities', now() - interval '1 day'),
('Maria Rodriguez', 'maria@apply.com', '+1-555-0202', 'https://example.com/resume2.pdf', 'Product manager with 5 years experience', now() - interval '2 days'),
('Chris Kim', 'chris@job.com', '+1-555-0203', 'https://example.com/resume3.pdf', 'UX designer passionate about user-centered design', now() - interval '3 days')
) AS v(name, email, phone, resume_url, cover_letter, created_at)
WHERE NOT EXISTS (SELECT 1 FROM general_applications WHERE general_applications.email = v.email);
