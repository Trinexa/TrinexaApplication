-- FIX DUPLICATE PAGE CONTENT CONSTRAINT ERROR
-- This script resolves the unique constraint violation error

-- Step 1: Check current state
SELECT 
  'CURRENT PAGE_CONTENT STATE' as status,
  page_id,
  section_id,
  COUNT(*) as duplicate_count
FROM page_content
GROUP BY page_id, section_id
HAVING COUNT(*) > 1;

-- Step 2: Remove any duplicates (keep the most recent one)
DELETE FROM page_content
WHERE id NOT IN (
  SELECT DISTINCT ON (page_id, section_id) id
  FROM page_content
  ORDER BY page_id, section_id, updated_at DESC
);

-- Step 3: Ensure we have a system user
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

-- Step 4: Initialize missing page content (upsert approach)
INSERT INTO page_content (page_id, section_id, content, updated_at, updated_by)
SELECT 
  ps.page_id,
  ps.section_id,
  ps.default_content,
  NOW(),
  '00000000-0000-0000-0000-000000000001'
FROM page_sections ps
ON CONFLICT (page_id, section_id) 
DO UPDATE SET
  updated_at = EXCLUDED.updated_at;

-- Step 5: Verify the fix
SELECT 
  'VERIFICATION: NO DUPLICATES' as status,
  page_id,
  section_id,
  COUNT(*) as count
FROM page_content
GROUP BY page_id, section_id
ORDER BY page_id, section_id;

-- Step 6: Show all page content summary
SELECT 
  'PAGE CONTENT SUMMARY' as status,
  page_id,
  COUNT(*) as section_count,
  MIN(updated_at) as earliest_update,
  MAX(updated_at) as latest_update
FROM page_content
GROUP BY page_id
ORDER BY page_id;
