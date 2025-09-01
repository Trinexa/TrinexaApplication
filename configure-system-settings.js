// Script to ensure all system settings are properly configured
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function configureSystemSettings() {
  console.log('🔧 Configuring system settings...');
  
  const defaultSettings = [
    { setting_key: 'company_name', setting_value: 'Trinexa', setting_type: 'text', description: 'Company name displayed across the website' },
    { setting_key: 'company_tagline', setting_value: 'Pioneering AI-powered solutions', setting_type: 'text', description: 'Company tagline or slogan' },
    { setting_key: 'logo_url', setting_value: 'https://via.placeholder.com/200x60/10B981/FFFFFF?text=TRINEXA', setting_type: 'image', description: 'Main company logo URL' },
    { setting_key: 'logo_alt_text', setting_value: 'Trinexa Logo', setting_type: 'text', description: 'Alt text for the logo' },
    { setting_key: 'favicon_url', setting_value: '', setting_type: 'image', description: 'Website favicon URL' },
    { setting_key: 'primary_color', setting_value: '#10B981', setting_type: 'text', description: 'Primary brand color' },
    { setting_key: 'secondary_color', setting_value: '#059669', setting_type: 'text', description: 'Secondary brand color' },
    { setting_key: 'contact_email', setting_value: 'contact@trinexa.com', setting_type: 'text', description: 'Main contact email' },
    { setting_key: 'contact_phone', setting_value: '+1 (555) 123-4567', setting_type: 'text', description: 'Main contact phone' },
    { setting_key: 'contact_address', setting_value: '123 Innovation Drive, Tech Valley, CA 94103', setting_type: 'text', description: 'Company address' },
    { setting_key: 'business_hours', setting_value: 'Mon-Fri: 9:00 AM - 6:00 PM', setting_type: 'text', description: 'Business operating hours' },
    { setting_key: 'support_email', setting_value: 'support@trinexa.com', setting_type: 'text', description: 'Support contact email' },
    { setting_key: 'social_twitter', setting_value: '', setting_type: 'text', description: 'Twitter profile URL' },
    { setting_key: 'social_facebook', setting_value: '', setting_type: 'text', description: 'Facebook profile URL' },
    { setting_key: 'social_linkedin', setting_value: '', setting_type: 'text', description: 'LinkedIn profile URL' },
    { setting_key: 'social_instagram', setting_value: '', setting_type: 'text', description: 'Instagram profile URL' }
  ];

  try {
    // Check current settings
    const { data: currentSettings, error: fetchError } = await supabase
      .from('system_settings')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching current settings:', fetchError);
      return;
    }
    
    console.log('📊 Current settings count:', currentSettings?.length || 0);
    
    // Insert or update each setting
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
        console.log(`✅ ${setting.setting_key}: ${setting.setting_value}`);
      }
    }
    
    // Verify final settings
    const { data: finalSettings, error: finalError } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key');
    
    if (finalError) {
      console.error('❌ Error fetching final settings:', finalError);
      return;
    }
    
    console.log('\n📋 All System Settings:');
    finalSettings?.forEach(setting => {
      console.log(`  ${setting.setting_key}: ${setting.setting_value || '(empty)'}`);
    });
    
    console.log('\n🎉 System settings configuration completed!');
    
  } catch (error) {
    console.error('❌ Configuration failed:', error);
  }
}

// Run the configuration
configureSystemSettings();
