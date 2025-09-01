// Simple script to setup logo in database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupLogo() {
  try {
    console.log('Setting up logo in database...');
    
    // First check if table exists and what data is there
    const { data: existingData, error: selectError } = await supabase
      .from('system_settings')
      .select('*');
    
    console.log('Existing system settings:', existingData);
    if (selectError) {
      console.error('Error reading system_settings:', selectError);
      return;
    }
    
    // Insert or update logo URL
    const logoUrl = 'https://via.placeholder.com/200x60/10B981/FFFFFF?text=TRINEXA';
    
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'logo_url',
        setting_value: logoUrl,
        setting_type: 'image',
        description: 'Company logo URL',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })
      .select();
    
    if (error) {
      console.error('Error setting logo:', error);
    } else {
      console.log('✅ Logo set successfully:', data);
    }
    
    // Also set company name
    const { data: nameData, error: nameError } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'company_name',
        setting_value: 'Trinexa',
        setting_type: 'text',
        description: 'Company name',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })
      .select();
    
    if (nameError) {
      console.error('Error setting company name:', nameError);
    } else {
      console.log('✅ Company name set successfully:', nameData);
    }
    
    // Verify the data
    const { data: finalData, error: finalError } = await supabase
      .from('system_settings')
      .select('*');
    
    console.log('Final system settings:', finalData);
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

setupLogo();
