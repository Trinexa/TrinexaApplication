-- Migration: Add user roles and create unified authentication system
-- Created at: 2025-08-06

-- 1. Drop existing tables in correct order to avoid foreign key conflicts
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE; 
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- 3. Create job_postings table
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    location VARCHAR(100),
    type VARCHAR(50),
    salary_range VARCHAR(100),
    description TEXT,
    requirements TEXT[],
    benefits TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for job_postings
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_department ON job_postings(department);
CREATE INDEX idx_job_postings_location ON job_postings(location);

-- 4. Create job_applications table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    cover_letter TEXT,
    resume_url TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for job_applications
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_email ON job_applications(applicant_email);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- 5. Insert demo user record
INSERT INTO users (id, email, full_name, phone, role, created_at, updated_at)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'demo@user.com',
    'Demo User',
    '+94 777 123 456',
    'user',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;

-- 6. Create sample job postings for testing
INSERT INTO job_postings (
    id,
    title,
    department,
    location,
    type,
    salary_range,
    description,
    requirements,
    benefits,
    status,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'Senior Software Engineer',
    'Engineering',
    'Colombo',
    'full-time',
    'LKR 200,000 - 300,000',
    'We are looking for a Senior Software Engineer to join our growing engineering team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.',
    ARRAY['5+ years of software development experience', 'Proficiency in React, Node.js, and TypeScript', 'Experience with cloud platforms (AWS, GCP, Azure)', 'Strong problem-solving skills', 'Excellent communication skills'],
    ARRAY['Competitive salary', 'Health insurance', 'Flexible working hours', 'Remote work options', 'Professional development opportunities'],
    'active',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'UI/UX Designer',
    'Design',
    'Remote',
    'full-time',
    'LKR 150,000 - 220,000',
    'Join our design team to create beautiful and intuitive user experiences. You will work closely with product managers and developers to design user-friendly interfaces for our AI-powered solutions.',
    ARRAY['3+ years of UI/UX design experience', 'Proficiency in Figma, Sketch, or Adobe XD', 'Understanding of user-centered design principles', 'Experience with prototyping tools', 'Strong portfolio showcasing design work'],
    ARRAY['Competitive salary', 'Health insurance', 'Creative work environment', 'Latest design tools and hardware', 'Professional development budget'],
    'active',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Data Scientist',
    'Data Science',
    'Kandy',
    'full-time',
    'LKR 180,000 - 250,000',
    'We are seeking a Data Scientist to help us extract insights from large datasets and build machine learning models that drive our AI solutions.',
    ARRAY['Masters degree in Data Science, Statistics, or related field', 'Experience with Python, R, and SQL', 'Knowledge of machine learning algorithms', 'Experience with data visualization tools', 'Strong analytical thinking'],
    ARRAY['Competitive salary', 'Health insurance', 'Flexible working hours', 'Access to latest ML tools', 'Conference attendance opportunities'],
    'active',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Marketing Intern',
    'Marketing',
    'Colombo',
    'internship',
    'LKR 40,000 - 60,000',
    'Join our marketing team as an intern and gain hands-on experience in digital marketing, content creation, and campaign management.',
    ARRAY['Currently pursuing or recently completed degree in Marketing, Business, or related field', 'Basic understanding of social media platforms', 'Creative mindset', 'Excellent written communication skills', 'Eagerness to learn'],
    ARRAY['Monthly stipend', 'Mentorship program', 'Certificate of completion', 'Networking opportunities', 'Potential for full-time conversion'],
    'active',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- 7. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- 8. Add RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 9. Add RLS policies for job_postings table
CREATE POLICY "Anyone can view active job postings" ON job_postings
    FOR SELECT USING (status = 'active');

-- 10. Add RLS policies for job_applications table
CREATE POLICY "Users can view own applications" ON job_applications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create applications" ON job_applications
    FOR INSERT WITH CHECK (user_id = auth.uid());
