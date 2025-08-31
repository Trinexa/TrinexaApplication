const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dbnwqpdxcftydnfbbzei.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiblpxcGR4Y2Z0eWRuZmJiemVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTc2NjIxMSwiZXhwIjoyMDA1MzQyMjExfQ.IA8kOo7FWSI6zVV3-yKrFmLHIj3sXNhEKL_9l8Sj7_M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFaviconSetup() {
  console.log('🎯 Testing Favicon Setup...');
  
  try {
    // Test favicon with SVG data URL
    const testFavicon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23EF4444"/></svg>';
    
    console.log('Setting test favicon...');
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'favicon_url',
        setting_value: testFavicon,
        setting_type: 'image',
        description: 'Website favicon URL'
      });
    
    if (error) {
      console.error('❌ Error setting favicon:', error);
    } else {
      console.log('✅ Favicon set successfully!');
      console.log('Test with this URL in your browser tab');
    }
    
    // Also set a test logo
    const testLogo = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><text x="5" y="25" font-family="Arial" font-size="16" font-weight="bold" fill="%2310B981">TRINEXA</text></svg>';
    
    console.log('Setting test logo...');
    const { data: logoData, error: logoError } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'logo_url',
        setting_value: testLogo,
        setting_type: 'image',
        description: 'Company logo URL'
      });
    
    if (logoError) {
      console.error('❌ Error setting logo:', logoError);
    } else {
      console.log('✅ Logo set successfully!');
    }
    
    // Verify settings
    console.log('\nVerifying settings...');
    const { data: allSettings, error: fetchError } = await supabase
      .from('system_settings')
      .select('*')
      .in('setting_key', ['favicon_url', 'logo_url']);
    
    if (fetchError) {
      console.error('❌ Error fetching settings:', fetchError);
    } else {
      console.log('📊 Current settings:');
      allSettings.forEach(setting => {
        console.log(`  ${setting.setting_key}: ${setting.setting_value?.substring(0, 50)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in favicon setup:', error);
  }
}

testFaviconSetup();
