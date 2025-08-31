-- SAFE INITIALIZE PAGE MANAGEMENT SYSTEM
-- This script safely sets up the page sections and handles column type issues

-- Step 1: Check the updated_by column type
SELECT 
  'UPDATED_BY COLUMN TYPE' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'page_content' AND column_name = 'updated_by';

-- Step 2: If updated_by is UUID type but we need to store system info, 
-- let's modify it to allow NULL or text
DO $$
BEGIN
  -- Check if updated_by is UUID type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_content' 
    AND column_name = 'updated_by' 
    AND data_type = 'uuid'
  ) THEN
    -- Change to TEXT to allow 'system' values
    ALTER TABLE page_content ALTER COLUMN updated_by TYPE TEXT;
    RAISE NOTICE 'Changed updated_by column from UUID to TEXT';
  END IF;
END $$;

-- Step 3: Create page sections for Home page
INSERT INTO page_sections (id, page_id, section_id, section_name, section_type, default_content, is_active, sort_order)
VALUES 
  (gen_random_uuid(), 'home', 'hero', 'Hero Section', 'hero', '{
    "title": "AI-Powered Solutions for the Future",
    "subtitle": "We create cutting-edge AI solutions that transform businesses and drive innovation. Our intelligent systems help you achieve more with less.",
    "cta_primary": "Explore Solutions",
    "cta_secondary": "Book a Demo",
    "cta_primary_link": "/products",
    "cta_secondary_link": "/book-demo",
    "background_image": "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  }', true, 1),
  
  (gen_random_uuid(), 'home', 'features', 'Features Section', 'list', '{
    "title": "Transformative AI Solutions",
    "subtitle": "Our cutting-edge AI technologies help businesses automate processes, gain valuable insights, and drive innovation.",
    "features": [
      {
        "title": "Cognitive Intelligence",
        "description": "Our AI systems learn and adapt to your business needs, providing intelligent insights and automating complex tasks.",
        "icon": "Brain"
      },
      {
        "title": "Predictive Analytics", 
        "description": "Harness the power of data with our advanced analytics to predict trends and make informed decisions.",
        "icon": "BarChart"
      },
      {
        "title": "Secure Infrastructure",
        "description": "Enterprise-grade security ensures your data is protected while our AI solutions work seamlessly.",
        "icon": "Shield"
      }
    ]
  }', true, 2),
  
  (gen_random_uuid(), 'home', 'stats', 'Statistics Section', 'stats', '{
    "title": "Trusted by Industry Leaders",
    "stats": [
      {"label": "Happy Clients", "value": "500+"},
      {"label": "Projects Completed", "value": "1000+"},
      {"label": "AI Models Deployed", "value": "50+"},
      {"label": "Years of Experience", "value": "10+"}
    ]
  }', true, 3)
ON CONFLICT (page_id, section_id) DO UPDATE SET
  default_content = EXCLUDED.default_content,
  section_name = EXCLUDED.section_name,
  section_type = EXCLUDED.section_type;

-- Step 4: Create page sections for About page
INSERT INTO page_sections (id, page_id, section_id, section_name, section_type, default_content, is_active, sort_order)
VALUES 
  (gen_random_uuid(), 'about', 'hero', 'Hero Section', 'hero', '{
    "title": "About NexusAI",
    "subtitle": "We are passionate about creating AI solutions that make a real difference in the world.",
    "background_image": "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg"
  }', true, 1),
  
  (gen_random_uuid(), 'about', 'mission', 'Mission Section', 'rich_text', '{
    "title": "Our Mission",
    "content": "To democratize artificial intelligence and make it accessible to businesses of all sizes, enabling them to harness the power of AI to solve complex problems and drive innovation.",
    "alignment": "center"
  }', true, 2),
  
  (gen_random_uuid(), 'about', 'vision', 'Vision Section', 'rich_text', '{
    "title": "Our Vision", 
    "content": "To be the leading provider of AI solutions that transform industries and improve lives worldwide.",
    "alignment": "center"
  }', true, 3)
ON CONFLICT (page_id, section_id) DO UPDATE SET
  default_content = EXCLUDED.default_content,
  section_name = EXCLUDED.section_name,
  section_type = EXCLUDED.section_type;

-- Step 5: Create page sections for Products page
INSERT INTO page_sections (id, page_id, section_id, section_name, section_type, default_content, is_active, sort_order)
VALUES 
  (gen_random_uuid(), 'products', 'hero', 'Hero Section', 'hero', '{
    "title": "Our AI Solutions",
    "subtitle": "Discover our comprehensive suite of AI-powered products designed to transform your business.",
    "background_image": "https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg"
  }', true, 1)
ON CONFLICT (page_id, section_id) DO UPDATE SET
  default_content = EXCLUDED.default_content,
  section_name = EXCLUDED.section_name,
  section_type = EXCLUDED.section_type;

-- Step 6: Create page sections for Careers page
INSERT INTO page_sections (id, page_id, section_id, section_name, section_type, default_content, is_active, sort_order)
VALUES 
  (gen_random_uuid(), 'careers', 'hero', 'Hero Section', 'hero', '{
    "title": "Join Our Team",
    "subtitle": "Be part of the AI revolution and help us build the future of intelligent technology.",
    "background_image": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
  }', true, 1)
ON CONFLICT (page_id, section_id) DO UPDATE SET
  default_content = EXCLUDED.default_content,
  section_name = EXCLUDED.section_name,
  section_type = EXCLUDED.section_type;

-- Step 7: Initialize page content with default values (now safe with TEXT updated_by)
INSERT INTO page_content (id, page_id, section_id, content, updated_at, updated_by)
SELECT 
  gen_random_uuid(),
  page_id,
  section_id,
  default_content,
  NOW(),
  'system'  -- Now this will work since we changed to TEXT
FROM page_sections
WHERE NOT EXISTS (
  SELECT 1 FROM page_content pc 
  WHERE pc.page_id = page_sections.page_id 
  AND pc.section_id = page_sections.section_id
);

-- Step 8: Verify the setup
SELECT 
  'PAGE SECTIONS CREATED' as status,
  page_id,
  COUNT(*) as section_count
FROM page_sections
GROUP BY page_id
ORDER BY page_id;

SELECT 
  'PAGE CONTENT INITIALIZED' as status,
  page_id,
  COUNT(*) as content_count
FROM page_content
GROUP BY page_id
ORDER BY page_id;

-- Step 9: Show sample of what was created
SELECT 
  'SAMPLE PAGE CONTENT' as status,
  page_id,
  section_id,
  LEFT(content::text, 100) || '...' as content_preview,
  updated_by
FROM page_content
ORDER BY page_id, section_id
LIMIT 10;
