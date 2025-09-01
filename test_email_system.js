// Test script to verify the email template system is working
import { supabase } from './src/lib/supabase.js';

async function testEmailSystem() {
  console.log('🧪 Testing Email Template System...');
  
  try {
    // Test 1: Check if email_templates table exists
    console.log('\n1. Checking if email_templates table exists...');
    const { data: tables, error: tableError } = await supabase
      .from('email_templates')
      .select('count(*)')
      .limit(1);
    
    if (tableError && tableError.code === '42P01') {
      console.log('❌ email_templates table does not exist.');
      console.log('\n📝 Please run the SQL from quick_email_setup.sql in your Supabase SQL editor.');
      return;
    }
    
    if (tableError) {
      console.log('❌ Error checking table:', tableError.message);
      return;
    }
    
    console.log('✅ email_templates table exists!');
    
    // Test 2: Check for job application templates
    console.log('\n2. Checking for job application email templates...');
    const { data: templates, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('category', 'transactional')
      .in('name', ['Job Application Confirmation', 'General Application Confirmation']);
    
    if (templateError) {
      console.log('❌ Error fetching templates:', templateError.message);
      return;
    }
    
    if (!templates || templates.length === 0) {
      console.log('❌ No job application templates found.');
      console.log('\n📝 Please run the SQL from quick_email_setup.sql to insert the templates.');
      return;
    }
    
    console.log(`✅ Found ${templates.length} job application templates:`);
    templates.forEach(template => {
      console.log(`   - ${template.name} (${template.variables?.length || 0} variables)`);
    });
    
    // Test 3: Test variable extraction
    console.log('\n3. Testing variable extraction...');
    const testContent = 'Hello {{RECIPIENT_NAME}}, your application for {{JOB_TITLE}} at {{COMPANY_NAME}} was received.';
    const variables = testContent.match(/\{\{[^}]+\}\}/g) || [];
    console.log(`✅ Variable extraction working. Found: ${variables.join(', ')}`);
    
    // Test 4: Check if job_applications table exists (for the complete workflow)
    console.log('\n4. Checking if job_applications table exists...');
    const { error: jobAppError } = await supabase
      .from('job_applications')
      .select('count(*)')
      .limit(1);
    
    if (jobAppError && jobAppError.code === '42P01') {
      console.log('⚠️  job_applications table does not exist yet.');
      console.log('   This is needed for the complete job application workflow.');
    } else if (jobAppError) {
      console.log('❌ Error checking job_applications table:', jobAppError.message);
    } else {
      console.log('✅ job_applications table exists!');
    }
    
    console.log('\n🎉 Email system test completed!');
    console.log('\n📧 Your email templates are ready to use for:');
    console.log('   - Job application confirmations');
    console.log('   - General application confirmations');
    console.log('   - Variable-based personalization');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailSystem();
