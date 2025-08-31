/*
  Test script to verify admin authentication and template creation
  
  This script will:
  1. Test admin login with demo credentials
  2. Verify admin user permissions
  3. Test template creation
  4. Debug any issues
*/

async function testTemplateCreation() {
  // You'll need to update these with your actual Supabase credentials
  const SUPABASE_URL = 'your-supabase-url';
  const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
  
  console.log('Testing template creation flow...');
  
  // Test credentials from the migration file
  const TEST_EMAIL = 'admin@nexusai.com';
  const TEST_PASSWORD = 'your-admin-password'; // You'll need to set this up
  
  try {
    // 1. Test authentication
    console.log('1. Testing authentication...');
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    
    if (!response.ok) {
      console.error('Login failed:', response.status, response.statusText);
      return;
    }
    
    console.log('Login successful!');
    
    // 2. Test template creation
    console.log('2. Testing template creation...');
    const testTemplate = {
      name: 'Test Template ' + Date.now(),
      category: 'custom',
      subject: 'Test Subject',
      content: 'This is a test template with {{name}} variable',
      variables: ['name']
    };
    
    const createResponse = await fetch('/api/message-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTemplate)
    });
    
    if (!createResponse.ok) {
      console.error('Template creation failed:', createResponse.status, createResponse.statusText);
      const errorText = await createResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const createdTemplate = await createResponse.json();
    console.log('Template created successfully:', createdTemplate);
    
    // 3. Verify template appears in list
    console.log('3. Verifying template appears in list...');
    const listResponse = await fetch('/api/message-templates');
    
    if (!listResponse.ok) {
      console.error('Failed to fetch templates:', listResponse.status);
      return;
    }
    
    const templates = await listResponse.json();
    const foundTemplate = templates.find(t => t.id === createdTemplate.id);
    
    if (foundTemplate) {
      console.log('✅ Template found in list! Test successful.');
    } else {
      console.error('❌ Template not found in list.');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Instructions for running this test:
console.log(`
To test template creation:

1. Update SUPABASE_URL and SUPABASE_ANON_KEY with your actual values
2. Set up a password for admin@nexusai.com in Supabase Auth
3. Run this script in the browser console after navigating to your admin page
4. Or adapt this code to work with your API endpoints

Alternative quick test:
1. Go to http://localhost:5173/admin/login
2. Log in with admin@nexusai.com
3. Navigate to Messages tab
4. Try creating a template and check browser console for debugging logs
`);

// Uncomment to run the test
// testTemplateCreation();
