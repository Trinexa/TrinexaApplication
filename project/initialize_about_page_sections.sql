-- INITIALIZE ABOUT PAGE SECTIONS
-- This creates the page sections for the about page that can be managed from the admin panel

-- Insert page sections for about page
INSERT INTO page_sections (page_id, section_id, section_name, section_type, default_content, display_order, is_active)
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
}', 1, true),

-- Story section
('about', 'story', 'Our Story', 'rich_text', '{
  "title": "Our Story",
  "content": "Founded in 2020, Trinexa was born from a vision to bridge the gap between advanced artificial intelligence and practical business applications. Our founders, a team of AI researchers and business strategists, recognized that while AI held tremendous potential, many businesses struggled to implement it effectively.\n\nStarting with a small team of 5 passionate innovators, we have grown to a global company with over 100 experts across AI research, software engineering, data science, and business consulting. Our growth has been fueled by a commitment to excellence and a deep understanding of how AI can solve real-world business challenges.",
  "image": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
}', 2, true),

-- Mission section
('about', 'mission', 'Mission & Vision', 'card', '{
  "title": "Our Mission & Vision",
  "subtitle": "Driving innovation through intelligent solutions",
  "mission_text": "To democratize AI by making advanced artificial intelligence accessible, practical, and transformative for businesses of all sizes.",
  "vision_text": "To be the global leader in AI innovation, creating a world where intelligent technology enhances human potential and drives sustainable growth."
}', 3, true),

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
}', 4, true),

-- CEO Message section
('about', 'ceo-message', 'CEO Message', 'card', '{
  "title": "A Message from Our CEO",
  "content": "At Trinexa, we believe that AI should empower businesses, not replace human ingenuity. Our commitment is to create AI solutions that amplify human potential and drive meaningful business outcomes. We are not just building technology; we are building the future of intelligent business operations.",
  "author": "Michael Chen",
  "position": "CEO & Co-Founder",
  "image": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
}', 5, true),

-- Stats section
('about', 'stats', 'Company Stats', 'stats', '{
  "title": "Our Impact",
  "items": [
    {
      "value": "500+",
      "label": "Projects Completed",
      "description": "Successful AI implementations across industries"
    },
    {
      "value": "98%",
      "label": "Client Satisfaction",
      "description": "Consistently high client satisfaction ratings"
    },
    {
      "value": "50+",
      "label": "Team Members",
      "description": "Expert AI researchers and engineers"
    },
    {
      "value": "25+",
      "label": "Countries Served",
      "description": "Global reach and impact"
    }
  ]
}', 6, true),

-- Team section
('about', 'team', 'Leadership Team', 'team_member', '{
  "title": "Our Leadership",
  "subtitle": "Meet the team driving our vision and innovation",
  "members": [
    {
      "name": "Michael Chen",
      "position": "CEO & Co-Founder",
      "bio": "With a background in AI research at MIT and experience leading tech startups, Michael drives our strategic vision.",
      "image": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
    },
    {
      "name": "Sarah Johnson",
      "position": "CTO & Co-Founder",
      "bio": "Sarah leads our technical teams, bringing expertise from her years as a lead AI researcher at Google.",
      "image": "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg"
    },
    {
      "name": "David Rodriguez",
      "position": "COO",
      "bio": "With over 15 years of operational experience at tech giants, David ensures our business runs efficiently.",
      "image": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
    }
  ]
}', 7, true)

ON CONFLICT (page_id, section_id) DO UPDATE SET
  section_name = EXCLUDED.section_name,
  default_content = EXCLUDED.default_content,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Verify the sections were created
SELECT 
  'ABOUT PAGE SECTIONS CREATED' as status,
  page_id,
  section_id,
  section_name,
  section_type,
  display_order,
  is_active
FROM page_sections 
WHERE page_id = 'about'
ORDER BY display_order;
