// Quick fix script to remove problematic templates
import { supabase } from './src/lib/supabase.js';

async function fixEmailTemplates() {
  console.log('🔧 Fixing email template UUID issue...');
  
  try {
    // Delete the problematic templates with invalid created_by
    console.log('1. Removing templates with invalid created_by values...');
    const { error: deleteError } = await supabase
      .from('email_templates')
      .delete()
      .in('name', ['Job Application Confirmation', 'General Application Confirmation'])
      .eq('category', 'transactional');
    
    if (deleteError) {
      console.error('Error deleting templates:', deleteError);
      return;
    }
    
    console.log('✅ Problematic templates removed');
    
    // Insert the correct templates
    console.log('2. Inserting corrected templates...');
    
    const templates = [
      {
        name: 'Job Application Confirmation',
        category: 'transactional',
        subject: 'Application Received: {{JOB_TITLE}} Position at {{COMPANY_NAME}}',
        content: '<html><body><h1>Thank you for your application!</h1><p>Your application for {{JOB_TITLE}} has been received.</p></body></html>',
        variables: ['{{RECIPIENT_NAME}}', '{{JOB_TITLE}}', '{{APPLICATION_ID}}', '{{COMPANY_NAME}}', '{{SUPPORT_EMAIL}}', '{{DATE}}', '{{YEAR}}'],
        is_active: true,
        usage_count: 0
      },
      {
        name: 'General Application Confirmation', 
        category: 'transactional',
        subject: 'General Application Received - {{COMPANY_NAME}}',
        content: '<html><body><h1>Thank you for your interest!</h1><p>Your general application has been received.</p></body></html>',
        variables: ['{{RECIPIENT_NAME}}', '{{APPLICATION_ID}}', '{{COMPANY_NAME}}', '{{SUPPORT_EMAIL}}', '{{DATE}}', '{{YEAR}}'],
        is_active: true,
        usage_count: 0
      }
    ];
    
    const { error: insertError } = await supabase
      .from('email_templates')
      .insert(templates);
    
    if (insertError) {
      console.error('Error inserting templates:', insertError);
      return;
    }
    
    console.log('✅ Templates inserted successfully');
    
    // Verify
    const { data: verifyData, error: verifyError } = await supabase
      .from('email_templates')
      .select('name, created_by')
      .eq('category', 'transactional');
    
    if (verifyError) {
      console.error('Error verifying:', verifyError);
      return;
    }
    
    console.log('📧 Verified templates:', verifyData);
    console.log('🎉 Email templates fixed! Try sending emails again.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixEmailTemplates();
