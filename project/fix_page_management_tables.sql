-- ADD MISSING COLUMNS TO PAGE MANAGEMENT TABLES
-- This ensures the tables have all required columns

-- Check current table structure
SELECT 
  'PAGE_SECTIONS COLUMNS' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'page_sections'
ORDER BY ordinal_position;

SELECT 
  'PAGE_CONTENT COLUMNS' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'page_content'
ORDER BY ordinal_position;

-- Add missing columns to page_sections if they don't exist
DO $$
BEGIN
  -- Add section_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_sections' AND column_name = 'section_type'
  ) THEN
    ALTER TABLE page_sections ADD COLUMN section_type TEXT DEFAULT 'text';
  END IF;
  
  -- Add default_content column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_sections' AND column_name = 'default_content'
  ) THEN
    ALTER TABLE page_sections ADD COLUMN default_content JSONB DEFAULT '{}';
  END IF;
  
  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_sections' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE page_sections ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  -- Add sort_order column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_sections' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE page_sections ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add missing columns to page_content if they don't exist
DO $$
BEGIN
  -- Add metadata column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_content' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE page_content ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- Create unique constraint on page_sections if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'page_sections' 
    AND constraint_name = 'page_sections_page_section_unique'
  ) THEN
    ALTER TABLE page_sections 
    ADD CONSTRAINT page_sections_page_section_unique 
    UNIQUE (page_id, section_id);
  END IF;
END $$;

-- Verify the changes
SELECT 
  'UPDATED PAGE_SECTIONS STRUCTURE' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'page_sections'
ORDER BY ordinal_position;

SELECT 
  'UPDATED PAGE_CONTENT STRUCTURE' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'page_content'
ORDER BY ordinal_position;
