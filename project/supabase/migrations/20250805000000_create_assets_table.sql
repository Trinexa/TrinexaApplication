-- Create assets table for storing logos, favicons, and other file uploads
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create policies for assets table
CREATE POLICY "Allow authenticated users to view assets" ON public.assets
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to insert assets" ON public.assets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to update assets" ON public.assets
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to delete assets" ON public.assets
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER assets_updated_at
    BEFORE UPDATE ON public.assets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default system assets (optional - you can run these manually)
-- Logo asset placeholder
INSERT INTO public.assets (name, type, file_name, file_size, mime_type, base64_data)
VALUES (
    'default_logo',
    'logo',
    'default_logo.png',
    1024,
    'image/png',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
) ON CONFLICT (name, type) DO NOTHING;

-- Favicon asset placeholder
INSERT INTO public.assets (name, type, file_name, file_size, mime_type, base64_data)
VALUES (
    'default_favicon',
    'favicon',
    'default_favicon.ico',
    512,
    'image/x-icon',
    'data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
) ON CONFLICT (name, type) DO NOTHING;

-- Update settings table to reference assets instead of storing base64 directly
-- Add asset_id columns to settings table (if settings table exists)
-- ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS logo_asset_id UUID REFERENCES public.assets(id);
-- ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS favicon_asset_id UUID REFERENCES public.assets(id);

-- Create view for easy asset access with URL generation
CREATE OR REPLACE VIEW public.asset_urls AS
SELECT 
    a.*,
    CASE 
        WHEN a.base64_data IS NOT NULL THEN a.base64_data
        ELSE NULL
    END as data_url
FROM public.assets a;

-- Grant permissions
GRANT SELECT ON public.asset_urls TO authenticated;
GRANT ALL ON public.assets TO authenticated;

-- Create function to get asset by type and name
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

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION public.get_asset_by_type(TEXT, TEXT) TO authenticated;

-- Create function to upsert assets
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

-- Grant execute permission on upsert function
GRANT EXECUTE ON FUNCTION public.upsert_asset(VARCHAR, VARCHAR, VARCHAR, INTEGER, VARCHAR, TEXT) TO authenticated;

COMMENT ON TABLE public.assets IS 'Stores file assets like logos, favicons, and other uploads with base64 data';
COMMENT ON COLUMN public.assets.type IS 'Type of asset: logo, favicon, image, document';
COMMENT ON COLUMN public.assets.base64_data IS 'Base64 encoded file data with mime type prefix';
COMMENT ON COLUMN public.assets.file_size IS 'File size in bytes, max 5MB';
