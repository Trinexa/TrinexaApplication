import { supabase } from '../src/lib/supabase.js';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  console.log('Running email template migrations...');
  
  try {
    // Read and execute the table creation migration
    const tableCreationSQL = fs.readFileSync(
      'supabase/migrations/20250730000000_ensure_email_templates_table.sql', 
      'utf8'
    );
    
    console.log('Creating email_templates table...');
    const { error: tableError } = await supabase.rpc('exec_sql', { 
      sql: tableCreationSQL 
    });
    
    if (tableError) {
      console.error('Error creating table:', tableError);
      return;
    }
    
    // Read and execute the template insertion migration
    const templateInsertSQL = fs.readFileSync(
      'supabase/migrations/20250731000001_add_job_application_email_templates.sql', 
      'utf8'
    );
    
    console.log('Inserting default email templates...');
    const { error: insertError } = await supabase.rpc('exec_sql', { 
      sql: templateInsertSQL 
    });
    
    if (insertError) {
      console.error('Error inserting templates:', insertError);
      return;
    }
    
    console.log('✅ Email template migrations completed successfully!');
    
    // Verify the templates were created
    const { data: templates, error: queryError } = await supabase
      .from('email_templates')
      .select('name, category')
      .eq('category', 'transactional');
      
    if (queryError) {
      console.error('Error querying templates:', queryError);
      return;
    }
    
    console.log('📧 Templates created:', templates);
    
  } catch (error) {
    console.error('Migration error:', error);
  }
}

runMigrations();
