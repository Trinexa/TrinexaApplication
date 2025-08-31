-- TEMPORARILY DISABLE RLS FOR DEMO BOOKINGS
-- This will help us identify if RLS is the root cause

-- Step 1: Check current RLS status
SELECT 
    'CURRENT RLS STATUS' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'demo_bookings';

-- Step 2: Disable RLS temporarily
ALTER TABLE demo_bookings DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify RLS is disabled
SELECT 
    'RLS AFTER DISABLE' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'demo_bookings';

-- Step 4: Test insert without RLS
INSERT INTO demo_bookings (name, email, company, phone, product_interest, message, preferred_date)
VALUES ('No RLS Test', 'norls@example.com', 'Test Company', '555-9999', 'Testing', 'Test without RLS', CURRENT_DATE);

-- Step 5: Show that it worked
SELECT 
    'INSERT WITHOUT RLS' as test_result,
    COUNT(*) as total_bookings
FROM demo_bookings;

-- Step 6: Show recent entries
SELECT 
    'RECENT ENTRIES' as result_type,
    name,
    email,
    company,
    created_at
FROM demo_bookings 
ORDER BY created_at DESC 
LIMIT 3;

-- IMPORTANT: After testing your form, re-enable RLS with proper policies
-- Run this after confirming the form works:
/*
-- Re-enable RLS
ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;

-- Create proper policies
CREATE POLICY "demo_bookings_public_access" ON demo_bookings
    FOR ALL 
    USING (true)
    WITH CHECK (true);
*/
