-- COMPLETE PAGE MANAGEMENT SETUP WITH SYSTEM USER
-- This creates a system admin user first, then initializes page content

-- Step 1: Create a system admin user for page management
INSERT INTO admin_users (id, email, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001', 
  'system@trinexa.com', 
  'super_admin', 
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  id = '00000000-0000-0000-0000-000000000001',
  role = 'super_admin';

-- Step 2: Initialize page content with the system user using UPSERT
INSERT INTO page_content (id, page_id, section_id, content, updated_at, updated_by)
SELECT 
  gen_random_uuid(),
  page_id,
  section_id,
  default_content,
  NOW(),
  '00000000-0000-0000-0000-000000000001'  -- Use system admin user
FROM page_sections
ON CONFLICT (page_id, section_id) 
DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = EXCLUDED.updated_at,
  updated_by = EXCLUDED.updated_by;

-- Step 3: Verify everything was created
SELECT 
  'SYSTEM USER CREATED' as status,
  id,
  email,
  role
FROM admin_users 
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 
  'PAGE CONTENT INITIALIZED' as status,
  page_id,
  COUNT(*) as content_count
FROM page_content
GROUP BY page_id
ORDER BY page_id;

-- Step 4: Show sample content
SELECT 
  'SAMPLE PAGE CONTENT' as status,
  pc.page_id,
  pc.section_id,
  au.email as updated_by_user,
  LEFT(pc.content::text, 100) || '...' as content_preview
FROM page_content pc
JOIN admin_users au ON pc.updated_by = au.id
ORDER BY pc.page_id, pc.section_id
LIMIT 10;
