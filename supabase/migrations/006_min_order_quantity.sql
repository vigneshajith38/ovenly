-- Migration 006: Add Minimum Order Quantity support for products (e.g. Min 3 for cupcakes)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS min_order INTEGER DEFAULT 1;

COMMENT ON COLUMN products.min_order IS 'Minimum number of pieces/quantity required per order for this item (e.g. 3 for cupcakes)';
