-- FIX RLS POLICY FOR DEMO BOOKINGS
-- The current policy is blocking anonymous insertions

-- Step 1: Check current policies
SELECT 
    'CURRENT POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'demo_bookings';

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "demo_bookings_insert_policy" ON demo_bookings;
DROP POLICY IF EXISTS "demo_bookings_select_policy" ON demo_bookings;
DROP POLICY IF EXISTS "demo_bookings_update_policy" ON demo_bookings;

-- Step 3: Create a simple, permissive policy for INSERT that allows both anon and authenticated
CREATE POLICY "demo_bookings_public_insert" ON demo_bookings
    FOR INSERT 
    WITH CHECK (true);

-- Step 4: Create SELECT policy for authenticated users only (admin access)
CREATE POLICY "demo_bookings_admin_select" ON demo_bookings
    FOR SELECT 
    TO authenticated
    USING (true);

-- Step 5: Create UPDATE policy for authenticated users only (admin access)
CREATE POLICY "demo_bookings_admin_update" ON demo_bookings
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Step 6: Verify new policies
SELECT 
    'NEW POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'demo_bookings';

-- Step 7: Test anonymous insert (this should work now)
-- Note: This simulates what your form does
INSERT INTO demo_bookings (name, email, company, phone, product_interest, message, preferred_date)
VALUES ('Anonymous Test', 'anon@example.com', 'Test Co', '555-0123', 'AI Solutions', 'Test from policy fix', CURRENT_DATE);

-- Step 8: Show results
SELECT 
    'INSERT TEST RESULT' as test_type,
    COUNT(*) as total_bookings
FROM demo_bookings;

-- Step 9: Show recent bookings
SELECT 
    'RECENT BOOKINGS' as result_type,
    name,
    email,
    company,
    product_interest,
    created_at
FROM demo_bookings 
ORDER BY created_at DESC 
LIMIT 3;
