-- DEMO BOOKINGS TROUBLESHOOTING
-- Check if demo_bookings table exists and fix CORS/permission issues

-- Step 1: Check if demo_bookings table exists
SELECT 
    'TABLE EXISTS' as check_type,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'demo_bookings';

-- Step 2: Check table structure
SELECT 
    'COLUMNS' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'demo_bookings'
ORDER BY ordinal_position;

-- Step 3: Check RLS policies for demo_bookings
SELECT 
    'RLS POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'demo_bookings';

-- Step 4: Check if RLS is enabled
SELECT 
    'RLS STATUS' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'demo_bookings';

-- Step 5: Create demo_bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS demo_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    phone TEXT NOT NULL,
    product_interest TEXT NOT NULL,
    message TEXT,
    preferred_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Enable RLS on demo_bookings
ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;

-- Step 7: Create permissive policies for demo_bookings
-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "demo_bookings_insert_policy" ON demo_bookings;
DROP POLICY IF EXISTS "demo_bookings_select_policy" ON demo_bookings;
DROP POLICY IF EXISTS "demo_bookings_update_policy" ON demo_bookings;

-- Allow anyone to insert demo bookings (for public form submissions)
CREATE POLICY "demo_bookings_insert_policy" ON demo_bookings
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Allow authenticated users to read demo bookings (for admin)
CREATE POLICY "demo_bookings_select_policy" ON demo_bookings
    FOR SELECT 
    TO authenticated
    USING (true);

-- Allow authenticated users to update demo bookings (for admin)
CREATE POLICY "demo_bookings_update_policy" ON demo_bookings
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Step 8: Test insert (this should work now)
INSERT INTO demo_bookings (name, email, company, phone, product_interest, message, preferred_date)
VALUES ('Test User', 'test@example.com', 'Test Company', '123-456-7890', 'CRM Solution', 'Test message', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Step 9: Verify everything works
SELECT 
    'FINAL TEST' as test_type,
    COUNT(*) as total_bookings
FROM demo_bookings;

-- Step 10: Show recent bookings
SELECT 
    'RECENT BOOKINGS' as result_type,
    id,
    name,
    email,
    company,
    product_interest,
    status,
    created_at
FROM demo_bookings 
ORDER BY created_at DESC 
LIMIT 5;
