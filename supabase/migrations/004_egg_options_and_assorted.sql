-- Migration 004: Add Egg/Eggless dietary options and Custom Assorted Tin support

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS dietary_type TEXT DEFAULT 'eggless' CHECK (dietary_type IN ('eggless', 'contains_egg', 'choice')),
ADD COLUMN IF NOT EXISTS is_custom_assorted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assorted_capacity INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS assorted_flavours JSONB DEFAULT '["Signature Choc Chip", "Double Chocolate Fudge", "Red Velvet White Choc", "Nutty Walnut Crunch", "Biscoff Lotus Swirl", "Salted Caramel Crisp"]'::jsonb;

-- Comment on columns for clear documentation in Supabase
COMMENT ON COLUMN products.dietary_type IS 'eggless = 100% Eggless, contains_egg = Contains Egg, choice = Customer can choose between Eggless or With Egg';
COMMENT ON COLUMN products.is_custom_assorted IS 'True if customers can pick and customize their own assorted tin flavours';
COMMENT ON COLUMN products.assorted_capacity IS 'Number of treats in the assorted tin (e.g., 6 or 12)';
COMMENT ON COLUMN products.assorted_flavours IS 'List of available flavours customer can pick for their assorted tin';

-- Update existing sample products to default to eggless
UPDATE products SET dietary_type = 'eggless' WHERE dietary_type IS NULL;
