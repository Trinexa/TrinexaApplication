/*
  # Complete Content Management System

  1. New Tables
    - `testimonials` - Manage testimonials separately
    - `job_positions` - Manage job openings
    - `faqs` - Manage FAQ sections
    - `company_values` - Manage company values
    - `benefits` - Manage benefits and perks
    - `story_sections` - Manage story sections
    - `mission_vision` - Manage mission and vision
    - `leadership_members` - Manage leadership team

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  author_name text NOT NULL,
  author_position text NOT NULL,
  author_company text,
  author_image text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active testimonials"
  ON testimonials
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow admin users to manage testimonials"
  ON testimonials
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Job positions table
CREATE TABLE IF NOT EXISTS job_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  requirements text[],
  responsibilities text[],
  benefits text[],
  salary_range text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active job positions"
  ON job_positions
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow admin users to manage job positions"
  ON job_positions
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin', 'recruitment_admin')
  ));

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  page_id text DEFAULT 'products',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active faqs"
  ON faqs
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow admin users to manage faqs"
  ON faqs
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Company values table
CREATE TABLE IF NOT EXISTS company_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text,
  page_id text DEFAULT 'careers',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active company values"
  ON company_values
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow admin users to manage company values"
  ON company_values
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Benefits table
CREATE TABLE IF NOT EXISTS benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active benefits"
  ON benefits
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow admin users to manage benefits"
  ON benefits
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Story sections table
CREATE TABLE IF NOT EXISTS story_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  section_type text DEFAULT 'story' CHECK (section_type IN ('story', 'history', 'milestone')),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE story_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active story sections"
  ON story_sections
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow admin users to manage story sections"
  ON story_sections
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Mission vision table
CREATE TABLE IF NOT EXISTS mission_vision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('mission', 'vision')),
  title text NOT NULL,
  content text NOT NULL,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mission_vision ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active mission vision"
  ON mission_vision
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow admin users to manage mission vision"
  ON mission_vision
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Leadership members table
CREATE TABLE IF NOT EXISTS leadership_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  bio text NOT NULL,
  image_url text NOT NULL,
  linkedin_url text,
  twitter_url text,
  email text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leadership_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active leadership members"
  ON leadership_members
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow admin users to manage leadership members"
  ON leadership_members
  USING (auth.uid() IN (
    SELECT id FROM admin_users
    WHERE role IN ('super_admin', 'content_admin')
  ));

-- Insert dummy testimonials
INSERT INTO testimonials (quote, author_name, author_position, author_company, author_image, sort_order) VALUES
  ('Trinexa''s predictive analytics platform has revolutionized our decision-making process. We''ve seen a 35% increase in operational efficiency since implementation.', 'Sarah Johnson', 'CTO', 'GlobalTech', 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', 1),
  ('The customer insight platform from Trinexa has transformed how we understand our market. We''ve increased customer retention by 28% in just six months.', 'Mark Williams', 'CEO', 'RetailNext', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', 2),
  ('Trinexa''s security solution identified vulnerabilities that our previous systems missed. Their AI-driven approach to cybersecurity is truly revolutionary.', 'David Chen', 'CISO', 'SecureTech', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', 3),
  ('The automation platform has streamlined our entire workflow. We''ve reduced manual tasks by 60% and improved accuracy significantly.', 'Emily Rodriguez', 'Operations Director', 'ManufacturingPro', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', 4),
  ('Working with Trinexa has been a game-changer for our startup. Their AI solutions helped us scale efficiently and compete with larger companies.', 'Alex Thompson', 'Founder', 'InnovateTech', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg', 5);

-- Insert dummy job positions
INSERT INTO job_positions (title, department, location, type, description, requirements, responsibilities, benefits, salary_range) VALUES
  ('Senior AI Engineer', 'Engineering', 'San Francisco, CA (Hybrid)', 'Full-time', 'Lead the development of cutting-edge AI models and algorithms that power our product suite. Work with a team of world-class engineers to build scalable AI solutions.', 
   ARRAY['5+ years of experience in AI/ML', 'PhD or Masters in Computer Science, AI, or related field', 'Proficiency in Python, TensorFlow, PyTorch', 'Experience with distributed systems', 'Strong problem-solving skills'],
   ARRAY['Design and implement AI algorithms', 'Lead technical architecture decisions', 'Mentor junior engineers', 'Collaborate with product teams', 'Research new AI technologies'],
   ARRAY['Competitive salary and equity', 'Health insurance', 'Flexible work arrangements', 'Learning budget'], '$150,000 - $200,000'),
   
  ('Machine Learning Researcher', 'Research', 'Remote (US)', 'Full-time', 'Research and develop novel machine learning approaches to solve complex business problems. Publish research and contribute to the AI community.',
   ARRAY['PhD in Machine Learning, AI, or related field', '3+ years of research experience', 'Published papers in top-tier conferences', 'Expertise in deep learning', 'Strong mathematical background'],
   ARRAY['Conduct cutting-edge research', 'Develop new ML algorithms', 'Publish research papers', 'Collaborate with engineering teams', 'Present at conferences'],
   ARRAY['Research budget', 'Conference attendance', 'Publication bonuses', 'Flexible schedule'], '$140,000 - $180,000'),
   
  ('Frontend Developer (React)', 'Engineering', 'Boston, MA (Hybrid)', 'Full-time', 'Create intuitive and beautiful user interfaces for our AI-powered products. Work closely with designers and backend engineers.',
   ARRAY['3+ years of React experience', 'Proficiency in TypeScript', 'Experience with modern CSS frameworks', 'Knowledge of UI/UX principles', 'Experience with testing frameworks'],
   ARRAY['Develop responsive web applications', 'Implement design systems', 'Optimize application performance', 'Write comprehensive tests', 'Collaborate with design team'],
   ARRAY['Modern tech stack', 'Design tools access', 'Team events', 'Professional development'], '$100,000 - $130,000'),
   
  ('Product Manager - AI Solutions', 'Product', 'New York, NY (Hybrid)', 'Full-time', 'Guide the strategy and roadmap for our AI product suite, working closely with engineering and design teams to deliver exceptional user experiences.',
   ARRAY['5+ years of product management experience', 'Experience with AI/ML products', 'Strong analytical skills', 'Excellent communication skills', 'Technical background preferred'],
   ARRAY['Define product strategy', 'Manage product roadmap', 'Work with cross-functional teams', 'Analyze user feedback', 'Drive product launches'],
   ARRAY['Product development tools', 'User research budget', 'Cross-functional collaboration', 'Growth opportunities'], '$130,000 - $160,000'),
   
  ('Data Scientist', 'Data Science', 'Remote (Global)', 'Full-time', 'Extract insights from complex datasets and develop models to solve client challenges. Work with large-scale data to drive business decisions.',
   ARRAY['Masters in Data Science, Statistics, or related field', '3+ years of data science experience', 'Proficiency in Python/R', 'Experience with SQL and big data tools', 'Strong statistical knowledge'],
   ARRAY['Analyze complex datasets', 'Build predictive models', 'Create data visualizations', 'Collaborate with business teams', 'Present findings to stakeholders'],
   ARRAY['Data tools and platforms', 'Remote work setup', 'Continuous learning', 'Global team collaboration'], '$110,000 - $140,000');

-- Insert dummy FAQs
INSERT INTO faqs (question, answer, category, page_id, sort_order) VALUES
  ('How quickly can I implement your AI solutions?', 'Most of our products can be implemented within 2-4 weeks, depending on the complexity of your existing systems and integration requirements. Our Professional Services team provides dedicated support throughout the implementation process.', 'implementation', 'products', 1),
  ('Do I need specialized technical staff to use your products?', 'No, our products are designed with user-friendly interfaces that don''t require specialized AI expertise. However, we do offer training programs to help your team maximize the value of our solutions.', 'technical', 'products', 2),
  ('How do you ensure data security and privacy?', 'We maintain the highest standards of data security with SOC 2 Type II and ISO 27001 certifications. All data is encrypted both in transit and at rest, and we comply with global privacy regulations including GDPR and CCPA.', 'security', 'products', 3),
  ('Can your solutions integrate with our existing systems?', 'Yes, our products are built with integration in mind. We offer pre-built connectors for popular business systems and APIs for custom integrations. Our Professional plan includes custom integration services.', 'integration', 'products', 4),
  ('What kind of support do you provide?', 'All plans include technical support, with response times varying by plan level. Professional and Enterprise plans include dedicated account managers and priority support, while Enterprise clients receive 24/7 support and a dedicated success manager.', 'support', 'products', 5),
  ('What is your pricing model?', 'We offer flexible pricing tiers to accommodate businesses of all sizes. Our Starter plan begins at $499/month, Professional at $1,299/month, and Enterprise pricing is customized based on your specific needs.', 'pricing', 'products', 6);

-- Insert dummy company values
INSERT INTO company_values (title, description, icon, page_id, sort_order) VALUES
  ('Innovation', 'We embrace creativity and experimentation, constantly pushing the boundaries of what''s possible with AI technology.', 'Zap', 'careers', 1),
  ('Collaboration', 'We believe in the power of diverse perspectives and collaborative problem-solving to create innovative solutions.', 'Users', 'careers', 2),
  ('Integrity', 'We act with honesty and integrity in all interactions, building trust with transparent practices and ethical AI development.', 'Heart', 'careers', 3),
  ('Excellence', 'We pursue excellence in everything we do, from code quality to client communications, constantly raising the bar.', 'Award', 'careers', 4),
  ('Adaptability', 'We embrace change and continuously evolve our approaches to stay at the forefront of AI innovation.', 'RefreshCw', 'careers', 5),
  ('Customer Focus', 'We put our clients at the center of everything we do, aligning our solutions with their unique needs and goals.', 'Target', 'careers', 6);

-- Insert dummy benefits
INSERT INTO benefits (title, description, icon, category, sort_order) VALUES
  ('Competitive Compensation', 'Attractive salary packages with performance bonuses and equity options for all employees.', 'DollarSign', 'compensation', 1),
  ('Health & Wellness', 'Comprehensive health insurance, dental, vision, and wellness programs including gym memberships.', 'Heart', 'health', 2),
  ('Remote Flexibility', 'Flexible work arrangements with options for remote work, hybrid schedules, and flexible hours.', 'Briefcase', 'work', 3),
  ('Learning & Development', 'Generous budget for courses, conferences, certifications, and continuous professional development.', 'GraduationCap', 'development', 4),
  ('Team Events', 'Regular team retreats, social activities, and company-wide events to build strong relationships.', 'Users', 'culture', 5),
  ('Work-Life Balance', 'Unlimited PTO policy, flexible schedules, and support for maintaining healthy work-life balance.', 'Coffee', 'balance', 6),
  ('Cutting-Edge Technology', 'Access to the latest tools, technologies, and resources to do your best work.', 'Laptop', 'technology', 7),
  ('Career Growth', 'Clear career progression paths with mentorship programs and leadership development opportunities.', 'TrendingUp', 'growth', 8);

-- Insert dummy story sections
INSERT INTO story_sections (title, content, image_url, section_type, sort_order) VALUES
  ('Our Story', 'Founded in 2020, Trinexa was born from a vision to bridge the gap between advanced artificial intelligence and practical business applications. Our founders, a team of AI researchers and business strategists, recognized that while AI held tremendous potential, many businesses struggled to implement it effectively.

Starting with a small team of 5 passionate innovators, we''ve grown to a global company with over 100 experts across AI research, software engineering, data science, and business consulting. Our growth has been fueled by a commitment to excellence and a deep understanding of how AI can solve real-world business challenges.

Today, we''re proud to serve clients across industries, from startups to Fortune 500 companies, all with the same dedication to delivering transformative AI solutions that drive measurable results.', 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg', 'story', 1);

-- Insert dummy mission and vision
INSERT INTO mission_vision (type, title, content, icon) VALUES
  ('mission', 'Our Mission', 'To democratize artificial intelligence by creating accessible, powerful, and ethical AI solutions that solve complex business challenges and drive innovation across industries.', 'Target'),
  ('vision', 'Our Vision', 'To be the global leader in AI innovation, creating a future where intelligent systems enhance human capabilities, drive business growth, and contribute positively to society.', 'Zap');

-- Insert dummy leadership members
INSERT INTO leadership_members (name, position, bio, image_url, linkedin_url, sort_order) VALUES
  ('Michael Chen', 'CEO & Co-Founder', 'With a background in AI research at MIT and experience leading tech startups, Michael drives our strategic vision and innovation roadmap. He has over 15 years of experience in the AI industry and has published numerous papers on machine learning applications.', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', 'https://linkedin.com/in/michaelchen', 1),
  ('Sarah Johnson', 'CTO & Co-Founder', 'Sarah leads our technical teams, bringing expertise from her years as a lead AI researcher at Google and Stanford University. She holds a PhD in Computer Science and specializes in deep learning and neural networks.', 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', 'https://linkedin.com/in/sarahjohnson', 2),
  ('David Rodriguez', 'COO', 'With over 15 years of operational experience at tech giants like Amazon and IBM, David ensures our business runs efficiently and scales effectively. He specializes in building high-performance teams and operational excellence.', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', 'https://linkedin.com/in/davidrodriguez', 3),
  ('Emily Watson', 'VP of Product', 'Emily brings a wealth of product management experience from her time at leading tech companies. She focuses on translating complex AI capabilities into user-friendly products that solve real business problems.', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', 'https://linkedin.com/in/emilywatson', 4);