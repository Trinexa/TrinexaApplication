-- Test script to manually create the assets table and test functions
-- Run this in your Supabase SQL editor

-- 1. Create the assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('logo', 'favicon', 'image', 'document')),
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    base64_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    
    -- Add constraints
    CONSTRAINT assets_file_size_check CHECK (file_size > 0 AND file_size <= 5242880), -- 5MB limit
    CONSTRAINT assets_name_type_unique UNIQUE (name, type)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at);

-- 3. Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
CREATE POLICY "Allow authenticated users to view assets" ON public.assets
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to insert assets" ON public.assets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to update assets" ON public.assets
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to delete assets" ON public.assets
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Create update trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger
CREATE TRIGGER assets_updated_at
    BEFORE UPDATE ON public.assets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Create helper functions
CREATE OR REPLACE FUNCTION public.get_asset_by_type(asset_type TEXT, asset_name TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    type VARCHAR,
    file_name VARCHAR,
    mime_type VARCHAR,
    base64_data TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.name,
        a.type,
        a.file_name,
        a.mime_type,
        a.base64_data,
        a.created_at
    FROM public.assets a
    WHERE a.type = asset_type
    AND (asset_name IS NULL OR a.name = asset_name)
    ORDER BY a.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.upsert_asset(
    p_name VARCHAR,
    p_type VARCHAR,
    p_file_name VARCHAR,
    p_file_size INTEGER,
    p_mime_type VARCHAR,
    p_base64_data TEXT
)
RETURNS UUID AS $$
DECLARE
    asset_id UUID;
BEGIN
    -- Insert or update asset
    INSERT INTO public.assets (name, type, file_name, file_size, mime_type, base64_data, created_by)
    VALUES (p_name, p_type, p_file_name, p_file_size, p_mime_type, p_base64_data, auth.uid())
    ON CONFLICT (name, type)
    DO UPDATE SET
        file_name = EXCLUDED.file_name,
        file_size = EXCLUDED.file_size,
        mime_type = EXCLUDED.mime_type,
        base64_data = EXCLUDED.base64_data,
        updated_at = TIMEZONE('utc'::text, NOW())
    RETURNING id INTO asset_id;
    
    RETURN asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_asset_by_type(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_asset(VARCHAR, VARCHAR, VARCHAR, INTEGER, VARCHAR, TEXT) TO authenticated;

-- 9. Test data (optional)
-- Uncomment and run if you want test data
/*
INSERT INTO public.assets (name, type, file_name, file_size, mime_type, base64_data)
VALUES (
    'company_logo',
    'logo',
    'logo.png',
    1024,
    'image/png',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
) ON CONFLICT (name, type) DO NOTHING;
*/
