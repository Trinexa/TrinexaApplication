import { supabase } from './lib/supabase';

const testSystemSettings = async () => {
  try {
    console.log('Testing system settings...');
    
    // Test 1: Check if table exists
    const { data: tableData, error: tableError } = await supabase
      .from('system_settings')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (tableError) {
      console.error('Table error:', tableError);
      return;
    }
    
    console.log('Table exists, count:', tableData);
    
    // Test 2: Get all settings
    const { data: allSettings, error: allError } = await supabase
      .from('system_settings')
      .select('*');
    
    if (allError) {
      console.error('All settings error:', allError);
      return;
    }
    
    console.log('All settings:', allSettings);
    
    // Test 3: Get logo URL specifically
    const { data: logoData, error: logoError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', 'logo_url')
      .single();
    
    if (logoError && logoError.code !== 'PGRST116') {
      console.error('Logo error:', logoError);
      return;
    }
    
    console.log('Logo setting:', logoData);
    
    // Test 4: Try to insert a test logo URL
    const { data: updateData, error: updateError } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'logo_url',
        setting_value: 'https://via.placeholder.com/200x60/10B981/FFFFFF?text=LOGO',
        setting_type: 'image',
        description: 'Test logo URL',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })
      .select()
      .single();
    
    if (updateError) {
      console.error('Update error:', updateError);
      return;
    }
    
    console.log('Updated logo setting:', updateData);
    console.log('✅ System settings test completed successfully');
    
  } catch (error) {
    console.error('❌ System settings test failed:', error);
  }
};

// Export for use in browser console
(window as any).testSystemSettings = testSystemSettings;

// Auto-run the test
testSystemSettings();
