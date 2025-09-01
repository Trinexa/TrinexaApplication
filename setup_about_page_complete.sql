-- COMPLETE ABOUT PAGE SETUP
-- This script sets up everything needed for the About page to work with the admin panel

-- Step 1: Ensure system admin user exists
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

-- Step 2: Insert about page sections
INSERT INTO page_sections (page_id, section_id, section_name, section_type, default_content, is_active)
VALUES 
-- Hero section
('about', 'hero', 'Hero Section', 'hero', '{
  "title": "About Trinexa",
  "subtitle": "We are on a mission to transform businesses through cutting-edge AI solutions that drive innovation and growth.",
  "cta_primary": "Learn More",
  "cta_secondary": "Contact Us",
  "cta_primary_link": "/products",
  "cta_secondary_link": "/contact",
  "background_image": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
}', true),

-- Story section
('about', 'story', 'Our Story', 'rich_text', '{
  "title": "Our Story",
  "content": "Founded in 2020, Trinexa was born from a vision to bridge the gap between advanced artificial intelligence and practical business applications. Our founders, a team of AI researchers and business strategists, recognized that while AI held tremendous potential, many businesses struggled to implement it effectively.",
  "image": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
}', true),

-- Mission section
('about', 'mission', 'Mission & Vision', 'card', '{
  "title": "Our Mission & Vision",
  "subtitle": "Driving innovation through intelligent solutions",
  "mission_text": "To democratize AI by making advanced artificial intelligence accessible, practical, and transformative for businesses of all sizes.",
  "vision_text": "To be the global leader in AI innovation, creating a world where intelligent technology enhances human potential and drives sustainable growth."
}', true),

-- Values section
('about', 'values', 'Our Values', 'list', '{
  "title": "Our Values",
  "subtitle": "The principles that guide everything we do",
  "items": [
    {
      "icon": "Award",
      "title": "Excellence",
      "description": "We strive for excellence in everything we do, from code quality to customer service."
    },
    {
      "icon": "Users",
      "title": "Collaboration", 
      "description": "We believe in the power of teamwork and collaborative innovation."
    },
    {
      "icon": "Target",
      "title": "Innovation",
      "description": "We continuously push the boundaries of what is possible with AI technology."
    },
    {
      "icon": "Heart",
      "title": "Integrity",
      "description": "We operate with honesty, transparency, and ethical practices."
    }
  ]
}', true),

-- CEO Message section
('about', 'ceo-message', 'CEO Message', 'card', '{
  "title": "A Message from Our CEO",
  "content": "At Trinexa, we believe that AI should empower businesses, not replace human ingenuity. Our commitment is to create AI solutions that amplify human potential and drive meaningful business outcomes.",
  "author": "Michael Chen",
  "position": "CEO & Co-Founder",
  "image": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
}', true),

-- Stats section
('about', 'stats', 'Company Stats', 'stats', '{
  "title": "Our Impact",
  "items": [
    {
      "value": "500+",
      "label": "Projects Completed",
      "description": "Successful AI implementations"
    },
    {
      "value": "98%", 
      "label": "Client Satisfaction",
      "description": "Consistently high ratings"
    },
    {
      "value": "50+",
      "label": "Team Members",
      "description": "Expert AI researchers"
    },
    {
      "value": "25+",
      "label": "Countries Served",
      "description": "Global reach and impact"
    }
  ]
}', true),

-- Team section
('about', 'team', 'Leadership Team', 'team_member', '{
  "title": "Our Leadership",
  "subtitle": "Meet the team driving our vision and innovation",
  "members": [
    {
      "name": "Michael Chen",
      "position": "CEO & Co-Founder", 
      "bio": "With a background in AI research at MIT, Michael drives our strategic vision.",
      "image": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
    },
    {
      "name": "Sarah Johnson",
      "position": "CTO & Co-Founder",
      "bio": "Sarah leads our technical teams with expertise from Google and Stanford.",
      "image": "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg"
    },
    {
      "name": "David Rodriguez", 
      "position": "COO",
      "bio": "15+ years of operational experience at tech giants like Amazon and IBM.",
      "image": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
    }
  ]
}', true)

ON CONFLICT (page_id, section_id) DO UPDATE SET
  section_name = EXCLUDED.section_name,
  default_content = EXCLUDED.default_content,
  is_active = EXCLUDED.is_active;

-- Step 3: Initialize page content for about page
INSERT INTO page_content (page_id, section_id, content, updated_at, updated_by)
SELECT 
  page_id,
  section_id,
  default_content,
  NOW(),
  '00000000-0000-0000-0000-000000000001'
FROM page_sections
WHERE page_id = 'about'
ON CONFLICT (page_id, section_id) 
DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = EXCLUDED.updated_at;

-- Step 4: Verification
SELECT 
  'ABOUT PAGE SETUP COMPLETE' as status,
  COUNT(*) as total_sections
FROM page_sections 
WHERE page_id = 'about';

SELECT 
  'ABOUT PAGE CONTENT' as status,
  pc.section_id,
  ps.section_name,
  CASE 
    WHEN LENGTH(pc.content::text) > 100 THEN LEFT(pc.content::text, 100) || '...'
    ELSE pc.content::text
  END as content_preview
FROM page_content pc
JOIN page_sections ps ON pc.page_id = ps.page_id AND pc.section_id = ps.section_id
WHERE pc.page_id = 'about'
ORDER BY pc.section_id;
