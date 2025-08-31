-- Remove the products overview section from page_sections and page_content tables
-- This removes the "Products Overview" section that was requested to be deleted

-- First, remove any content associated with this section
DELETE FROM page_content 
WHERE section_id = 'overview' AND page_id = 'products';

-- Then remove the section definition itself
DELETE FROM page_sections 
WHERE section_id = 'overview' AND page_id = 'products';

-- Update the sort_order of remaining sections to maintain proper ordering
UPDATE page_sections 
SET sort_order = sort_order - 1 
WHERE page_id = 'products' AND sort_order > 2;
