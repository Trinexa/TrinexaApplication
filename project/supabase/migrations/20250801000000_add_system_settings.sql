/*
  # System Settings and Logo Management

  1. New Tables
    - `system_settings` - Store global system configurations like logo, company name, etc.

  2. Features
    - Dynamic logo management
    - Company branding settings
    - Global system configurations
*/

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'text' CHECK (setting_type IN ('text', 'image', 'json', 'boolean', 'number')),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "system_settings_policy" ON system_settings;
CREATE POLICY "system_settings_policy" ON system_settings FOR ALL USING (true);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'Trinexa', 'text', 'Company name displayed across the website'),
('company_tagline', 'Pioneering AI-powered solutions', 'text', 'Company tagline or slogan'),
('logo_url', '', 'image', 'Main company logo URL'),
('logo_alt_text', 'Trinexa Logo', 'text', 'Alt text for the logo'),
('favicon_url', '', 'image', 'Website favicon URL'),
('primary_color', '#10B981', 'text', 'Primary brand color'),
('secondary_color', '#059669', 'text', 'Secondary brand color'),
('contact_email', 'contact@trinexa.com', 'text', 'Main contact email'),
('contact_phone', '+1 (555) 123-4567', 'text', 'Main contact phone'),
('contact_address', '123 Innovation Drive, Tech Valley, CA 94103', 'text', 'Company address'),
('business_hours', 'Mon-Fri: 9:00 AM - 6:00 PM', 'text', 'Business operating hours'),
('support_email', 'support@trinexa.com', 'text', 'Support contact email'),
('social_twitter', '', 'text', 'Twitter profile URL'),
('social_facebook', '', 'text', 'Facebook profile URL'),
('social_linkedin', '', 'text', 'LinkedIn profile URL'),
('social_instagram', '', 'text', 'Instagram profile URL')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();
