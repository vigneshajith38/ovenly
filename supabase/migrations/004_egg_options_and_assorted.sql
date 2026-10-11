-- Migration 004: Add Custom Assorted Tin support (3 flavours)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_custom_assorted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assorted_capacity INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS assorted_flavours JSONB DEFAULT '["Signature Chocolate Chip", "Double Chocolate Fudge", "Red Velvet White Choc", "Biscoff Lotus Swirl", "Nutty Walnut Crunch", "Salted Caramel Crisp"]'::jsonb;

-- Comment on columns for clear documentation in Supabase
COMMENT ON COLUMN products.is_custom_assorted IS 'True if customers can pick and customize their own assorted tin flavours';
COMMENT ON COLUMN products.assorted_capacity IS 'Number of flavours in the assorted tin (e.g., 3)';
COMMENT ON COLUMN products.assorted_flavours IS 'List of available flavours customer can pick for their assorted tin';
