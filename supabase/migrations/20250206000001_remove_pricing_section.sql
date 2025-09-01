-- Remove the pricing section from page_sections and page_content tables
-- This removes the "Flexible Pricing Options" section from the products page

-- First, remove any content associated with the pricing section
DELETE FROM page_content 
WHERE section_id = 'pricing' AND page_id = 'products';

-- Then remove the section definition itself
DELETE FROM page_sections 
WHERE section_id = 'pricing' AND page_id = 'products';

-- Update the sort_order of remaining sections to maintain proper ordering
-- Move case-studies from position 4 to position 3
-- Move faq from position 5 to position 4
UPDATE page_sections 
SET sort_order = 3
WHERE page_id = 'products' AND section_id = 'case-studies';

UPDATE page_sections 
SET sort_order = 4
WHERE page_id = 'products' AND section_id = 'faq';
