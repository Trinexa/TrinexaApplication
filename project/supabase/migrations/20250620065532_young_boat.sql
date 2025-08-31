/*
  # Enhanced Page Management System

  1. New Tables
    - `page_sections` - Define all editable sections across the website
      - `id` (uuid, primary key)
      - `page_id` (text) - home, about, products, careers, etc.
      - `section_id` (text) - hero, ceo-message, features, etc.
      - `section_name` (text) - Human readable name
      - `section_type` (text) - text, rich_text, image, card, list, etc.
      - `default_content` (jsonb) - Default content structure
      - `is_active` (boolean) - Whether section is editable
      - `sort_order` (integer) - Display order
      - `created_at` (timestamp)

    - Enhanced `page_content` table with more fields
      - Add `section_type` and `metadata` columns

  2. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Page sections definition table
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id text NOT NULL,
  section_id text NOT NULL,
  section_name text NOT NULL,
  section_type text NOT NULL CHECK (section_type IN ('text', 'rich_text', 'image', 'card', 'list', 'hero', 'stats', 'testimonial', 'team_member')),
  default_content jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(page_id, section_id)
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to page_sections"
  ON page_sections
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow admin users to manage page_sections"
  ON page_sections
  USING (auth.uid() IN (
    SELECT id FROM admin_users 
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Add columns to existing page_content table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_content' AND column_name = 'section_type'
  ) THEN
    ALTER TABLE page_content ADD COLUMN section_type text DEFAULT 'text';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_content' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE page_content ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;
END $$;

-- Insert comprehensive page sections for all pages
INSERT INTO page_sections (page_id, section_id, section_name, section_type, default_content, sort_order) VALUES
  -- Home Page Sections
  ('home', 'hero', 'Hero Section', 'hero', '{"title": "AI-Powered Solutions for the Future", "subtitle": "We create cutting-edge AI solutions that transform businesses and drive innovation.", "cta_primary": "Explore Solutions", "cta_secondary": "Book a Demo", "background_image": "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg"}', 1),
  ('home', 'features', 'Features Section', 'list', '{"title": "Transformative AI Solutions", "subtitle": "Our cutting-edge AI technologies help businesses automate processes, gain valuable insights, and drive innovation.", "items": [{"title": "Cognitive Intelligence", "description": "Our AI systems learn and adapt to your business needs.", "icon": "Brain"}, {"title": "Predictive Analytics", "description": "Harness the power of data with our advanced analytics.", "icon": "BarChart"}]}', 2),
  ('home', 'stats', 'Statistics Section', 'stats', '{"items": [{"value": "98%", "label": "Client Satisfaction"}, {"value": "250+", "label": "Projects Delivered"}, {"value": "35%", "label": "Efficiency Increase"}, {"value": "24/7", "label": "Support Available"}]}', 3),
  ('home', 'testimonials', 'Testimonials Section', 'testimonial', '{"title": "Trusted by Industry Leaders", "subtitle": "See how our AI solutions have transformed businesses across various industries.", "testimonials": [{"quote": "NexusAI has revolutionized our decision-making process.", "author": "Sarah Johnson", "position": "CTO, GlobalTech", "image": "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg"}]}', 4),
  ('home', 'cta', 'Call to Action', 'hero', '{"title": "Ready to Transform Your Business with AI?", "subtitle": "Join hundreds of forward-thinking companies that are already leveraging our AI solutions.", "cta_primary": "Get Started Today"}', 5),

  -- About Page Sections
  ('about', 'hero', 'About Hero Section', 'hero', '{"title": "About NexusAI", "subtitle": "We are on a mission to transform businesses through cutting-edge AI solutions that drive innovation and growth."}', 1),
  ('about', 'story', 'Our Story Section', 'rich_text', '{"title": "Our Story", "content": "Founded in 2020, NexusAI was born from a vision to bridge the gap between advanced artificial intelligence and practical business applications. Our founders, a team of AI researchers and business strategists, recognized that while AI held tremendous potential, many businesses struggled to implement it effectively.", "image": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"}', 2),
  ('about', 'mission-vision', 'Mission & Vision', 'card', '{"title": "Our Mission & Vision", "cards": [{"title": "Our Mission", "content": "To democratize artificial intelligence by creating accessible, powerful, and ethical AI solutions.", "icon": "Target"}, {"title": "Our Vision", "content": "To be the global leader in AI innovation, creating a future where intelligent systems enhance human capabilities.", "icon": "Zap"}]}', 3),
  ('about', 'values', 'Core Values', 'list', '{"title": "Our Core Values", "subtitle": "These principles guide our decisions, shape our culture, and define how we work.", "items": [{"title": "Excellence", "description": "We pursue excellence in everything we do.", "icon": "Award"}, {"title": "Innovation", "description": "We foster a culture of continuous innovation.", "icon": "Coffee"}]}', 4),
  ('about', 'leadership', 'Leadership Team', 'team_member', '{"title": "Our Leadership", "subtitle": "Meet the team driving our vision and innovation in AI technology.", "members": [{"name": "Michael Chen", "position": "CEO & Co-Founder", "bio": "With a background in AI research at MIT and experience leading tech startups.", "image": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"}, {"name": "Sarah Johnson", "position": "CTO & Co-Founder", "bio": "Sarah leads our technical teams, bringing expertise from Google and Stanford.", "image": "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg"}]}', 5),
  ('about', 'ceo-message', 'CEO Message', 'card', '{"title": "Message from Our CEO", "content": "At NexusAI, we believe that artificial intelligence should enhance human potential, not replace it. Our mission is to create AI solutions that are not only powerful but also ethical and accessible to businesses of all sizes. We are committed to building a future where AI serves humanity and drives positive change across industries.", "author": "Michael Chen", "position": "CEO & Co-Founder", "image": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"}', 6),

  -- Products Page Sections
  ('products', 'hero', 'Products Hero', 'hero', '{"title": "Our AI Products", "subtitle": "Cutting-edge AI solutions designed to solve your most complex business challenges."}', 1),
  ('products', 'overview', 'Products Overview', 'rich_text', '{"title": "Transformative AI Solutions", "content": "Our suite of AI products is designed to address specific business needs while being flexible enough to adapt to your unique challenges."}', 2),
  ('products', 'pricing', 'Pricing Section', 'card', '{"title": "Flexible Pricing Options", "subtitle": "Choose the plan that works best for your business needs and scale as you grow.", "plans": [{"name": "Starter", "price": "$499", "period": "/month", "features": ["Access to one product", "5 user accounts", "Basic support"]}, {"name": "Professional", "price": "$1,299", "period": "/month", "features": ["Access to three products", "20 user accounts", "Priority support"], "popular": true}]}', 3),
  ('products', 'case-studies', 'Case Studies', 'testimonial', '{"title": "Success Stories", "subtitle": "See how our products have transformed businesses across industries.", "cases": [{"title": "How GlobalBank Reduced Fraud by 73%", "category": "Finance", "description": "Using NexusGuard advanced threat detection.", "image": "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg"}]}', 4),
  ('products', 'faq', 'FAQ Section', 'list', '{"title": "Frequently Asked Questions", "subtitle": "Find answers to common questions about our products and services.", "items": [{"question": "How quickly can I implement your AI solutions?", "answer": "Most of our products can be implemented within 2-4 weeks."}, {"question": "Do I need specialized technical staff?", "answer": "No, our products are designed with user-friendly interfaces."}]}', 5),

  -- Careers Page Sections
  ('careers', 'hero', 'Careers Hero', 'hero', '{"title": "Join Our Team", "subtitle": "Help us shape the future of AI and build innovative solutions that transform businesses."}', 1),
  ('careers', 'why-join', 'Why Join Us', 'rich_text', '{"title": "Why Join NexusAI?", "content": "Work on challenging problems, collaborate with brilliant minds, and make a real impact.", "image": "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg"}', 2),
  ('careers', 'values', 'Our Values', 'list', '{"title": "Our Values", "subtitle": "These principles guide our work and define our culture.", "items": [{"title": "Innovation", "description": "We embrace creativity and experimentation.", "icon": "Zap"}, {"title": "Collaboration", "description": "We believe in the power of diverse perspectives.", "icon": "Users"}]}', 3),
  ('careers', 'benefits', 'Benefits & Perks', 'list', '{"title": "Benefits & Perks", "subtitle": "We offer comprehensive benefits to support your well-being and professional growth.", "items": [{"title": "Competitive Compensation", "description": "Attractive salary packages and equity options.", "icon": "DollarSign"}, {"title": "Health & Wellness", "description": "Comprehensive health insurance and wellness programs.", "icon": "Heart"}]}', 4),
  ('careers', 'process', 'Hiring Process', 'list', '{"title": "Our Hiring Process", "subtitle": "We have designed a thoughtful process to get to know you.", "items": [{"title": "Application Review", "description": "Our recruitment team reviews your application.", "duration": "1-3 days"}, {"title": "Initial Interview", "description": "30-minute video call with a recruiter.", "duration": "30 minutes"}]}', 5);

-- Insert actual page content based on sections
INSERT INTO page_content (page_id, section_id, content, section_type, metadata, updated_by) VALUES
  -- Home page content
  ('home', 'hero', '{"title": "AI-Powered Solutions for the Future", "subtitle": "We create cutting-edge AI solutions that transform businesses and drive innovation. Our intelligent systems help you achieve more with less.", "cta_primary": "Explore Solutions", "cta_secondary": "Book a Demo", "background_image": "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg"}', 'hero', '{"last_updated": "2025-01-15"}', '550e8400-e29b-41d4-a716-446655440001'),
  
  ('home', 'features', '{"title": "Transformative AI Solutions", "subtitle": "Our cutting-edge AI technologies help businesses automate processes, gain valuable insights, and drive innovation.", "items": [{"title": "Cognitive Intelligence", "description": "Our AI systems learn and adapt to your business needs, providing intelligent insights and automating complex tasks.", "icon": "Brain"}, {"title": "Predictive Analytics", "description": "Harness the power of data with our advanced analytics to predict trends and make informed decisions.", "icon": "BarChart"}, {"title": "Enhanced Security", "description": "Our AI security solutions identify and mitigate threats in real-time to protect your valuable assets.", "icon": "Shield"}, {"title": "Process Automation", "description": "Streamline operations and reduce costs with intelligent automation of repetitive tasks and workflows.", "icon": "Zap"}, {"title": "Cloud Integration", "description": "Seamlessly integrate our AI solutions with your existing cloud infrastructure for maximum efficiency.", "icon": "Server"}, {"title": "Customer Insights", "description": "Gain deeper understanding of your customers through AI-powered analysis of behavior and preferences.", "icon": "Users"}]}', 'list', '{"section_layout": "grid", "columns": 3}', '550e8400-e29b-41d4-a716-446655440001'),
  
  ('home', 'stats', '{"title": "Trusted by Industry Leaders", "items": [{"value": "98%", "label": "Client Satisfaction"}, {"value": "250+", "label": "Projects Delivered"}, {"value": "35%", "label": "Efficiency Increase"}, {"value": "24/7", "label": "Support Available"}]}', 'stats', '{"background": "dark", "layout": "horizontal"}', '550e8400-e29b-41d4-a716-446655440001'),
  
  ('home', 'testimonials', '{"title": "Trusted by Industry Leaders", "subtitle": "See how our AI solutions have transformed businesses across various industries.", "testimonials": [{"quote": "NexusAI predictive analytics platform has revolutionized our decision-making process. We have seen a 35% increase in operational efficiency since implementation.", "author": "Sarah Johnson", "position": "CTO, GlobalTech", "image": "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg"}, {"quote": "The customer insight platform from NexusAI has transformed how we understand our market. We have increased customer retention by 28% in just six months.", "author": "Mark Williams", "position": "CEO, RetailNext", "image": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"}, {"quote": "NexusAI security solution identified vulnerabilities that our previous systems missed. Their AI-driven approach to cybersecurity is truly revolutionary.", "author": "David Chen", "position": "CISO, SecureTech", "image": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"}]}', 'testimonial', '{"layout": "carousel", "auto_rotate": true}', '550e8400-e29b-41d4-a716-446655440001'),
  
  -- About page content
  ('about', 'hero', '{"title": "About NexusAI", "subtitle": "We are on a mission to transform businesses through cutting-edge AI solutions that drive innovation and growth.", "background_image": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"}', 'hero', '{"overlay": "dark"}', '550e8400-e29b-41d4-a716-446655440001'),
  
  ('about', 'story', '{"title": "Our Story", "content": "Founded in 2020, NexusAI was born from a vision to bridge the gap between advanced artificial intelligence and practical business applications. Our founders, a team of AI researchers and business strategists, recognized that while AI held tremendous potential, many businesses struggled to implement it effectively.\n\nStarting with a small team of 5 passionate innovators, we have grown to a global company with over 100 experts across AI research, software engineering, data science, and business consulting. Our growth has been fueled by a commitment to excellence and a deep understanding of how AI can solve real-world business challenges.\n\nToday, we are proud to serve clients across industries, from startups to Fortune 500 companies, all with the same dedication to delivering transformative AI solutions that drive measurable results.", "image": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"}', 'rich_text', '{"layout": "side_by_side", "image_position": "left"}', '550e8400-e29b-41d4-a716-446655440001'),
  
  ('about', 'ceo-message', '{"title": "Message from Our CEO", "content": "At NexusAI, we believe that artificial intelligence should enhance human potential, not replace it. Our mission is to create AI solutions that are not only powerful but also ethical and accessible to businesses of all sizes.\n\nWe are committed to building a future where AI serves humanity and drives positive change across industries. Every solution we develop is designed with our core values in mind: excellence, innovation, integrity, and collaboration.\n\nAs we continue to grow and evolve, we remain focused on our founding principle: making AI work for everyone. Thank you for being part of our journey.", "author": "Michael Chen", "position": "CEO & Co-Founder", "image": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg", "signature": "Michael Chen"}', 'card', '{"style": "executive_message", "background": "gradient"}', '550e8400-e29b-41d4-a716-446655440001'),
  
  ('about', 'mission-vision', '{"title": "Our Mission & Vision", "subtitle": "We are driven by a clear purpose that guides everything we do.", "cards": [{"title": "Our Mission", "content": "To democratize artificial intelligence by creating accessible, powerful, and ethical AI solutions that solve complex business challenges and drive innovation across industries.", "icon": "Target"}, {"title": "Our Vision", "content": "To be the global leader in AI innovation, creating a future where intelligent systems enhance human capabilities, drive business growth, and contribute positively to society.", "icon": "Zap"}]}', 'card', '{"layout": "two_column", "style": "bordered"}', '550e8400-e29b-41d4-a716-446655440001'),
  
  ('about', 'leadership', '{"title": "Our Leadership", "subtitle": "Meet the team driving our vision and innovation in AI technology.", "members": [{"name": "Michael Chen", "position": "CEO & Co-Founder", "bio": "With a background in AI research at MIT and experience leading tech startups, Michael drives our strategic vision and innovation roadmap.", "image": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg", "linkedin": "https://linkedin.com/in/michaelchen"}, {"name": "Sarah Johnson", "position": "CTO & Co-Founder", "bio": "Sarah leads our technical teams, bringing expertise from her years as a lead AI researcher at Google and Stanford University.", "image": "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg", "linkedin": "https://linkedin.com/in/sarahjohnson"}, {"name": "David Rodriguez", "position": "COO", "bio": "With over 15 years of operational experience at tech giants like Amazon and IBM, David ensures our business runs efficiently.", "image": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg", "linkedin": "https://linkedin.com/in/davidrodriguez"}]}', 'team_member', '{"layout": "grid", "columns": 3}', '550e8400-e29b-41d4-a716-446655440001'),
  
  -- Products page content
  ('products', 'hero', '{"title": "Our AI Products", "subtitle": "Cutting-edge AI solutions designed to solve your most complex business challenges.", "background_image": "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg"}', 'hero', '{"overlay": "gradient"}', '550e8400-e29b-41d4-a716-446655440001'),
  
  ('products', 'pricing', '{"title": "Flexible Pricing Options", "subtitle": "Choose the plan that works best for your business needs and scale as you grow.", "plans": [{"name": "Starter", "price": "$499", "period": "/month", "description": "Perfect for small businesses taking their first steps with AI.", "features": ["Access to one product", "5 user accounts", "Basic support", "500K API calls/month"], "cta": "Get Started"}, {"name": "Professional", "price": "$1,299", "period": "/month", "description": "Ideal for growing businesses seeking advanced AI capabilities.", "features": ["Access to three products", "20 user accounts", "Priority support", "2M API calls/month", "Custom integrations"], "popular": true, "cta": "Get Started"}, {"name": "Enterprise", "price": "Custom", "period": "", "description": "Tailored solutions for large organizations with complex requirements.", "features": ["Access to all products", "Unlimited user accounts", "24/7 dedicated support", "Unlimited API calls", "Dedicated success manager"], "cta": "Contact Sales"}]}', 'card', '{"layout": "three_column", "highlight_popular": true}', '550e8400-e29b-41d4-a716-446655440001'),
  
  -- Careers page content
  ('careers', 'hero', '{"title": "Join Our Team", "subtitle": "Help us shape the future of AI and build innovative solutions that transform businesses.", "cta_primary": "View Open Positions", "background_image": "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg"}', 'hero', '{"overlay": "dark"}', '550e8400-e29b-41d4-a716-446655440001'),
  
  ('careers', 'benefits', '{"title": "Benefits & Perks", "subtitle": "We offer comprehensive benefits to support your well-being and professional growth.", "items": [{"title": "Competitive Compensation", "description": "Attractive salary packages and equity options.", "icon": "DollarSign"}, {"title": "Health & Wellness", "description": "Comprehensive health insurance and wellness programs.", "icon": "Heart"}, {"title": "Remote Flexibility", "description": "Flexible work arrangements to suit your lifestyle.", "icon": "Briefcase"}, {"title": "Learning & Development", "description": "Generous budget for courses, conferences, and education.", "icon": "GraduationCap"}, {"title": "Team Events", "description": "Regular team retreats and social activities.", "icon": "Users"}, {"title": "Work-Life Balance", "description": "Unlimited PTO policy and flexible schedules.", "icon": "Coffee"}]}', 'list', '{"layout": "grid", "columns": 3}', '550e8400-e29b-41d4-a716-446655440001')

ON CONFLICT (page_id, section_id) DO UPDATE SET
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  metadata = EXCLUDED.metadata,
  updated_at = now(),
  updated_by = EXCLUDED.updated_by;