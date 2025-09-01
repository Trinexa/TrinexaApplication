-- FIND ALL FOREIGN KEY REFERENCES TO admin_users
-- Run this first to identify all tables that reference admin_users

-- Find all foreign key constraints that reference admin_users
SELECT 
  'FOREIGN KEY CONSTRAINTS' as info,
  tc.table_name as referencing_table,
  kcu.column_name as referencing_column,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'admin_users';

-- Check actual data in tables that reference admin_users
-- This will show you what needs to be updated

-- Check page_content table
SELECT 
  'page_content references' as table_name,
  updated_by,
  COUNT(*) as count
FROM page_content 
WHERE updated_by IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
)
GROUP BY updated_by;

-- Check message_templates table
SELECT 
  'message_templates references' as table_name,
  created_by,
  COUNT(*) as count
FROM message_templates 
WHERE created_by IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
)
GROUP BY created_by;

-- Check admin_messages table (if exists)
SELECT 
  'admin_messages references' as table_name,
  sent_by,
  COUNT(*) as count
FROM admin_messages 
WHERE sent_by IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
)
GROUP BY sent_by;

-- Check scheduled_messages table (if exists)
SELECT 
  'scheduled_messages references' as table_name,
  created_by,
  COUNT(*) as count
FROM scheduled_messages 
WHERE created_by IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
)
GROUP BY created_by;

-- Check demo_assignments table (if exists)
SELECT 
  'demo_assignments admin_user_id references' as table_name,
  admin_user_id,
  COUNT(*) as count
FROM demo_assignments 
WHERE admin_user_id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
)
GROUP BY admin_user_id;

SELECT 
  'demo_assignments assigned_by references' as table_name,
  assigned_by,
  COUNT(*) as count
FROM demo_assignments 
WHERE assigned_by IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
)
GROUP BY assigned_by;
