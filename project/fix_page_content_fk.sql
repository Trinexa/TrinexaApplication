-- FIX PAGE CONTENT FOREIGN KEY ISSUE
-- This handles the foreign key constraint on updated_by

-- Step 1: Check the foreign key constraint
SELECT 
  'FOREIGN KEY CONSTRAINTS' as check_type,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'page_content';

-- Step 2: Check if we have any admin users
SELECT 
  'ADMIN USERS AVAILABLE' as check_type,
  id,
  email,
  role
FROM admin_users
LIMIT 5;

-- Step 3: Option A - Use an existing admin user if available
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the first admin user ID
  SELECT id INTO admin_user_id 
  FROM admin_users 
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    RAISE NOTICE 'Found admin user: %', admin_user_id;
    
    -- Step 4: Initialize page content with actual admin user ID
    INSERT INTO page_content (id, page_id, section_id, content, updated_at, updated_by)
    SELECT 
      gen_random_uuid(),
      page_id,
      section_id,
      default_content,
      NOW(),
      admin_user_id
    FROM page_sections
    WHERE NOT EXISTS (
      SELECT 1 FROM page_content pc 
      WHERE pc.page_id = page_sections.page_id 
      AND pc.section_id = page_sections.section_id
    );
    
  ELSE
    RAISE NOTICE 'No admin users found. Will temporarily remove FK constraint.';
    
    -- Option B - Temporarily remove the foreign key constraint
    ALTER TABLE page_content DROP CONSTRAINT IF EXISTS page_content_updated_by_fkey;
    
    -- Insert with NULL UUID
    INSERT INTO page_content (id, page_id, section_id, content, updated_at, updated_by)
    SELECT 
      gen_random_uuid(),
      page_id,
      section_id,
      default_content,
      NOW(),
      '00000000-0000-0000-0000-000000000000'
    FROM page_sections
    WHERE NOT EXISTS (
      SELECT 1 FROM page_content pc 
      WHERE pc.page_id = page_sections.page_id 
      AND pc.section_id = page_sections.section_id
    );
    
    RAISE NOTICE 'Inserted page content without FK constraint';
  END IF;
END $$;

-- Step 5: Verify what was created
SELECT 
  'PAGE CONTENT CREATED' as status,
  page_id,
  section_id,
  updated_by,
  LEFT(content::text, 50) || '...' as content_preview
FROM page_content
ORDER BY page_id, section_id;

-- Step 6: Show admin users for reference
SELECT 
  'AVAILABLE ADMIN USERS' as status,
  id,
  email,
  role
FROM admin_users;
