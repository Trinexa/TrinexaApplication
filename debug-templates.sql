-- Test script to debug template creation issues

-- Check if message_templates table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'message_templates';

-- Check table structure
\d message_templates;

-- Check if there are any existing templates
SELECT COUNT(*) as template_count FROM message_templates;

-- Check admin users table
SELECT COUNT(*) as admin_count FROM admin_users;

-- Show first few templates if any exist
SELECT id, name, category, created_at FROM message_templates LIMIT 5;

-- Check for any constraints or issues
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'message_templates'::regclass;
