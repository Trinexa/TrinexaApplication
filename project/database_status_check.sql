-- Database Status Check and Missing Functionality Report
-- Run this to check current table structure and identify missing functionality

-- Check admin_users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;

-- Check if admin_users table exists and has data
SELECT COUNT(*) as admin_user_count FROM admin_users;

-- Check products table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check if products table exists and has data
SELECT COUNT(*) as products_count FROM products;

-- Check demo_bookings table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'demo_bookings' 
ORDER BY ordinal_position;

-- Check if demo_bookings table exists and has data
SELECT COUNT(*) as demo_bookings_count FROM demo_bookings;

-- Check general_applications table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'general_applications' 
ORDER BY ordinal_position;

-- Check if general_applications table exists and has data
SELECT COUNT(*) as general_applications_count FROM general_applications;

-- Check message_management table structure (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_management') THEN
        RAISE NOTICE 'Message Management table structure:';
        PERFORM column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'message_management' 
        ORDER BY ordinal_position;
    ELSE
        RAISE NOTICE 'message_management table does not exist';
    END IF;
END $$;

-- Check if message_management table exists and has data
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_management') THEN
        EXECUTE 'SELECT COUNT(*) as message_management_count FROM message_management';
    ELSE
        RAISE NOTICE 'message_management table does not exist - count: 0';
    END IF;
END $$;

-- Check system_settings table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'system_settings' 
ORDER BY ordinal_position;

-- Check if system_settings table exists and has data
SELECT COUNT(*) as system_settings_count FROM system_settings;

-- Check all tables in the database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
