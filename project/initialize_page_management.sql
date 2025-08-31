-- INITIALIZE PAGE MANAGEMENT SYSTEM
-- This script sets up the page sections and default content for the admin panel

-- Step 1: Create page sections for Home page
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

-- Step 2: Create page sections for About page
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

-- Step 3: Create page sections for Products page
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

-- Step 4: Create page sections for Careers page
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

-- Step 5: Initialize page content with default values
INSERT INTO page_content (id, page_id, section_id, content, updated_at, updated_by)
SELECT 
  gen_random_uuid(),
  page_id,
  section_id,
  default_content,
  NOW(),
  '00000000-0000-0000-0000-000000000000'  -- Use NULL UUID for system
FROM page_sections
WHERE NOT EXISTS (
  SELECT 1 FROM page_content pc 
  WHERE pc.page_id = page_sections.page_id 
  AND pc.section_id = page_sections.section_id
);

-- Step 6: Verify the setup
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
