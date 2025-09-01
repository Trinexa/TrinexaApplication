// Simple email template setup using the existing API structure
import { api } from './src/services/api.js';

async function setupEmailTemplates() {
  console.log('Setting up email templates...');
  
  try {
    // Test if we can access the email templates
    const result = await api.emailTemplates.getAll();
    console.log('API result:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.message.includes('relation "email_templates" does not exist')) {
      console.log('\n❌ The email_templates table does not exist in your Supabase database.');
      console.log('\n📋 Please copy and run the following SQL in your Supabase SQL Editor:');
      console.log('\n' + '='.repeat(60));
      console.log('-- Step 1: Create admin_users table (if not exists)');
      console.log(`CREATE TABLE IF NOT EXISTS admin_users (
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

-- Step 2: Create email_templates table
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

-- Step 3: Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "email_templates_policy" ON email_templates FOR ALL USING (true);`);
      console.log('\n' + '='.repeat(60));
      console.log('\n✅ After running the above SQL, run this script again to insert the default templates.');
      console.log('\n🔗 Access your Supabase SQL Editor at: https://supabase.com/dashboard/project/[your-project-id]/sql');
    }
  }
}

setupEmailTemplates();
