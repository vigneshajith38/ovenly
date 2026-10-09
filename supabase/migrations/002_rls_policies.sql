-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Products Policies
-- Public can view published products
CREATE POLICY "Public can view published products"
  ON products FOR SELECT
  USING (is_published = true);

-- Admins (authenticated users) can do everything on products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Reviews Policies
-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

-- Public can insert pending reviews
CREATE POLICY "Public can insert pending reviews"
  ON reviews FOR INSERT
  WITH CHECK (status = 'pending');

-- Admins (authenticated users) can do everything on reviews
CREATE POLICY "Admins can manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
