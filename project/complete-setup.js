// Complete database setup and logo configuration
console.log('Starting comprehensive database setup...');

// First, let's create the supabase client manually
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSystemSettings() {
  try {
    console.log('🔧 Setting up system settings...');
    
    // First, try to create the table if it doesn't exist
    const createTableQuery = `
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
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableQuery });
    if (createError) {
      console.log('⚠️ Table creation error (may already exist):', createError.message);
    } else {
      console.log('✅ Table created or already exists');
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;' 
    });
    if (rlsError) {
      console.log('⚠️ RLS error (may already be enabled):', rlsError.message);
    }
    
    // Create policy
    const { error: policyError } = await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY IF NOT EXISTS "system_settings_policy" ON system_settings FOR ALL USING (true);`
    });
    if (policyError) {
      console.log('⚠️ Policy error (may already exist):', policyError.message);
    }
    
    // Check if table exists and is accessible
    const { data: tableCheck, error: checkError } = await supabase
      .from('system_settings')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (checkError) {
      console.error('❌ Cannot access system_settings table:', checkError);
      return false;
    }
    
    console.log('✅ Table is accessible, current row count:', tableCheck?.length || 0);
    
    // Setup default settings
    const defaultSettings = [
      { setting_key: 'company_name', setting_value: 'Trinexa', setting_type: 'text', description: 'Company name' },
      { setting_key: 'company_tagline', setting_value: 'Pioneering AI-powered solutions', setting_type: 'text', description: 'Company tagline' },
      { setting_key: 'logo_url', setting_value: 'https://via.placeholder.com/200x60/10B981/FFFFFF?text=TRINEXA', setting_type: 'image', description: 'Company logo URL' },
      { setting_key: 'logo_alt_text', setting_value: 'Trinexa Logo', setting_type: 'text', description: 'Logo alt text' },
      { setting_key: 'primary_color', setting_value: '#10B981', setting_type: 'text', description: 'Primary color' },
      { setting_key: 'secondary_color', setting_value: '#059669', setting_type: 'text', description: 'Secondary color' },
      { setting_key: 'contact_email', setting_value: 'contact@trinexa.com', setting_type: 'text', description: 'Contact email' },
      { setting_key: 'contact_phone', setting_value: '+1 (555) 123-4567', setting_type: 'text', description: 'Contact phone' },
      { setting_key: 'contact_address', setting_value: '123 Innovation Drive, Tech Valley, CA 94103', setting_type: 'text', description: 'Contact address' }
    ];
    
    console.log('📝 Inserting default settings...');
    
    for (const setting of defaultSettings) {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert({
          ...setting,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        })
        .select();
      
      if (error) {
        console.error(`❌ Error setting ${setting.setting_key}:`, error);
      } else {
        console.log(`✅ Set ${setting.setting_key}:`, setting.setting_value);
      }
    }
    
    // Verify all settings
    const { data: finalSettings, error: finalError } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key');
    
    if (finalError) {
      console.error('❌ Error fetching final settings:', finalError);
      return false;
    }
    
    console.log('\n📊 Final system settings:');
    finalSettings.forEach(setting => {
      console.log(`  ${setting.setting_key}: ${setting.setting_value}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

async function main() {
  const success = await setupSystemSettings();
  if (success) {
    console.log('\n🎉 Database setup completed successfully!');
    console.log('💡 The logo should now be visible in the application.');
    console.log('🔗 Logo URL: https://via.placeholder.com/200x60/10B981/FFFFFF?text=TRINEXA');
  } else {
    console.log('\n❌ Database setup failed. Please check the errors above.');
  }
}

main();
