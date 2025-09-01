// Debug script to check authentication and admin user status
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuth() {
  try {
    console.log('=== Authentication Debug ===');
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'EXISTS' : 'NONE');
    console.log('Session error:', sessionError);
    
    if (session) {
      console.log('User ID:', session.user.id);
      console.log('User email:', session.user.email);
      
      // Check if user exists in admin_users
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      console.log('Admin user:', adminUser);
      console.log('Admin error:', adminError);
      
      // Try to create a test template
      console.log('\n=== Template Creation Test ===');
      const testTemplate = {
        name: 'Debug Test Template',
        category: 'custom',
        subject: 'Test Subject',
        content: 'Test content',
        variables: ['name'],
        created_by: session.user.id
      };
      
      const { data: createdTemplate, error: createError } = await supabase
        .from('message_templates')
        .insert([testTemplate])
        .select()
        .single();
      
      console.log('Created template:', createdTemplate);
      console.log('Create error:', createError);
      
      // Check all admin users
      const { data: allAdmins, error: allAdminsError } = await supabase
        .from('admin_users')
        .select('*');
      
      console.log('\n=== All Admin Users ===');
      console.log('All admins:', allAdmins);
      console.log('All admins error:', allAdminsError);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Run the debug function
debugAuth();
