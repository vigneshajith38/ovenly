-- Migration 005: Add Brownie pieces, piece count, and flour selection (Maida vs Ragi)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS piece_count TEXT,
ADD COLUMN IF NOT EXISTS pieces INTEGER,
ADD COLUMN IF NOT EXISTS has_flour_choice BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flour_options JSONB DEFAULT '["Classic Maida", "Healthy Ragi"]'::jsonb;

-- Comment on columns for Supabase documentation
COMMENT ON COLUMN products.piece_count IS 'Descriptive piece count label (e.g. "9 Pieces (500g)", "4 Pieces")';
COMMENT ON COLUMN products.pieces IS 'Numeric number of pieces included in the product';
COMMENT ON COLUMN products.has_flour_choice IS 'True if customer can choose between Classic Maida or Healthy Ragi base';
COMMENT ON COLUMN products.flour_options IS 'Array of flour base options available for this product';
