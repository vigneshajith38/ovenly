-- Setup Storage for Ovenly

-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true);
-- Note: review-photos is public to display approved reviews. The frontend will only load paths from approved reviews.

-- Product Images Policies
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'product-images' );

CREATE POLICY "Admins can manage product images"
  ON storage.objects FOR ALL
  TO authenticated
  USING ( bucket_id = 'product-images' )
  WITH CHECK ( bucket_id = 'product-images' );

-- Review Photos Policies
CREATE POLICY "Public can view review photos"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'review-photos' );

CREATE POLICY "Public can upload review photos"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'review-photos' );

CREATE POLICY "Admins can manage review photos"
  ON storage.objects FOR ALL
  TO authenticated
  USING ( bucket_id = 'review-photos' )
  WITH CHECK ( bucket_id = 'review-photos' );
