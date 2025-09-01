-- TEST PAGE MANAGEMENT FUNCTIONALITY
-- Run this to test if page management can save content without errors

-- Test 1: Try to update existing content (this should work without constraint errors)
UPDATE page_content 
SET content = jsonb_set(
  COALESCE(content, '{}'),
  '{test_update}',
  '"Updated at ' || NOW()::text || '"'
),
updated_at = NOW()
WHERE page_id = 'home' AND section_id = 'hero'
RETURNING page_id, section_id, content->'test_update' as test_value;

-- Test 2: Try to insert new content using UPSERT (this should handle duplicates)
INSERT INTO page_content (page_id, section_id, content, updated_at, updated_by)
VALUES (
  'test_page',
  'test_section', 
  '{"title": "Test Content", "description": "This is a test"}',
  NOW(),
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (page_id, section_id) 
DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = EXCLUDED.updated_at
RETURNING page_id, section_id, content;

-- Test 3: Clean up test data
DELETE FROM page_content 
WHERE page_id = 'test_page' AND section_id = 'test_section';

-- Test 4: Show current content status
SELECT 
  'CURRENT STATUS' as status,
  page_id,
  section_id,
  CASE 
    WHEN content IS NOT NULL THEN 'HAS_CONTENT'
    ELSE 'NO_CONTENT'
  END as content_status,
  updated_at
FROM page_content
ORDER BY page_id, section_id
LIMIT 10;
