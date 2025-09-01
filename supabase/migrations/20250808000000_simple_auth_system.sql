-- Migration: Simple unified authentication system
-- Created at: 2025-08-08

-- 1. Drop existing tables safely
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE; 
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create job_applications table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    user_id UUID,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    cover_letter TEXT,
    resume_url TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add foreign key constraints
ALTER TABLE job_applications 
ADD CONSTRAINT fk_job_applications_job_id 
FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE;

ALTER TABLE job_applications 
ADD CONSTRAINT fk_job_applications_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 6. Create indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_department ON job_postings(department);
CREATE INDEX idx_job_postings_location ON job_postings(location);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_email ON job_applications(applicant_email);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- 7. Insert sample data
INSERT INTO users (id, email, full_name, phone, role)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'demo@user.com',
    'Demo User',
    '+94 777 123 456',
    'user'
);

-- 8. Insert sample job postings
INSERT INTO job_postings (title, department, location, type, salary_range, description, requirements, benefits, status) 
VALUES 
(
    'Senior Software Engineer',
    'Engineering',
    'Colombo',
    'full-time',
    'LKR 200,000 - 300,000',
    'We are looking for a Senior Software Engineer to join our growing engineering team.',
    ARRAY['5+ years experience', 'React/Node.js', 'TypeScript', 'Cloud platforms'],
    ARRAY['Competitive salary', 'Health insurance', 'Flexible hours', 'Remote work'],
    'active'
),
(
    'UI/UX Designer',
    'Design',
    'Remote',
    'full-time',
    'LKR 150,000 - 220,000',
    'Join our design team to create beautiful user experiences.',
    ARRAY['3+ years UI/UX experience', 'Figma/Sketch', 'Design principles', 'Prototyping'],
    ARRAY['Competitive salary', 'Health insurance', 'Creative environment', 'Latest tools'],
    'active'
),
(
    'Data Scientist',
    'Data Science',
    'Kandy',
    'full-time',
    'LKR 180,000 - 250,000',
    'Help us extract insights from data and build ML models.',
    ARRAY['Masters in Data Science', 'Python/R/SQL', 'ML algorithms', 'Data visualization'],
    ARRAY['Competitive salary', 'Health insurance', 'Flexible hours', 'ML tools access'],
    'active'
),
(
    'Marketing Intern',
    'Marketing',
    'Colombo',
    'internship',
    'LKR 40,000 - 60,000',
    'Gain hands-on experience in digital marketing.',
    ARRAY['Marketing/Business degree', 'Social media knowledge', 'Creative mindset', 'Communication skills'],
    ARRAY['Monthly stipend', 'Mentorship', 'Certificate', 'Networking opportunities'],
    'active'
);

-- 9. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can view active job postings" ON job_postings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view own applications" ON job_applications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create applications" ON job_applications
    FOR INSERT WITH CHECK (user_id = auth.uid());
