/*
# Create favorites, comments, and downloads tables

1. New Tables
- `favorites` - Client photo favorites
  - `id` (uuid, primary key)
  - `photo_id` (uuid, references photos)
  - `event_id` (uuid, references events)
  - `client_name` (text)
  - `client_email` (text)
  - `created_at` (timestamp)

- `comments` - Comments on photos
  - `id` (uuid, primary key)
  - `photo_id` (uuid, references photos)
  - `event_id` (uuid, references events)
  - `author_name` (text)
  - `author_email` (text)
  - `content` (text, not null)
  - `created_at` (timestamp)

- `downloads` - Download tracking
  - `id` (uuid, primary key)
  - `photo_id` (uuid, references photos)
  - `event_id` (uuid, references events)
  - `downloader_name` (text)
  - `downloader_email` (text)
  - `download_type` (text, enum: web, high_res, zip)
  - `created_at` (timestamp)

- `testimonials` - Website testimonials
  - `id` (uuid, primary key)
  - `client_name` (text, not null)
  - `client_title` (text)
  - `content` (text, not null)
  - `rating` (integer)
  - `image_url` (text)
  - `is_featured` (boolean, default false)
  - `created_at` (timestamp)

- `pricing_packages` - Photography packages
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `tier` (text, enum: silver, gold, premium, custom)
  - `price` (integer)
  - `description` (text)
  - `features` (text[])
  - `is_popular` (boolean, default false)
  - `sort_order` (integer, default 0)
  - `created_at` (timestamp)

2. Security
- Enable RLS on all tables
- Favorites/Comments/Downloads: public can create and read
- Testimonials/Packages: public read, admin write
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_name text,
  client_email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author_name text,
  author_email text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid REFERENCES photos(id) ON DELETE SET NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  downloader_name text,
  downloader_email text,
  download_type text DEFAULT 'web' CHECK (download_type IN ('web', 'high_res', 'zip')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_title text,
  content text NOT NULL,
  rating integer DEFAULT 5,
  image_url text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text DEFAULT 'silver' CHECK (tier IN ('silver', 'gold', 'premium', 'custom')),
  price integer,
  description text,
  features text[],
  is_popular boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_packages ENABLE ROW LEVEL SECURITY;

-- Favorites policies
DROP POLICY IF EXISTS "favorites_select_public" ON favorites;
CREATE POLICY "favorites_select_public" ON favorites FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "favorites_insert_public" ON favorites;
CREATE POLICY "favorites_insert_public" ON favorites FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "favorites_delete_public" ON favorites;
CREATE POLICY "favorites_delete_public" ON favorites FOR DELETE
TO anon, authenticated USING (true);

-- Comments policies
DROP POLICY IF EXISTS "comments_select_public" ON comments;
CREATE POLICY "comments_select_public" ON comments FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "comments_insert_public" ON comments;
CREATE POLICY "comments_insert_public" ON comments FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "comments_delete_public" ON comments;
CREATE POLICY "comments_delete_public" ON comments FOR DELETE
TO anon, authenticated USING (true);

-- Downloads policies
DROP POLICY IF EXISTS "downloads_select_public" ON downloads;
CREATE POLICY "downloads_select_public" ON downloads FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "downloads_insert_public" ON downloads;
CREATE POLICY "downloads_insert_public" ON downloads FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Testimonials policies
DROP POLICY IF EXISTS "testimonials_select_public" ON testimonials;
CREATE POLICY "testimonials_select_public" ON testimonials FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "testimonials_insert_admin" ON testimonials;
CREATE POLICY "testimonials_insert_admin" ON testimonials FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "testimonials_update_admin" ON testimonials;
CREATE POLICY "testimonials_update_admin" ON testimonials FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "testimonials_delete_admin" ON testimonials;
CREATE POLICY "testimonials_delete_admin" ON testimonials FOR DELETE
TO anon, authenticated USING (true);

-- Pricing packages policies
DROP POLICY IF EXISTS "packages_select_public" ON pricing_packages;
CREATE POLICY "packages_select_public" ON pricing_packages FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "packages_insert_admin" ON pricing_packages;
CREATE POLICY "packages_insert_admin" ON pricing_packages FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "packages_update_admin" ON pricing_packages;
CREATE POLICY "packages_update_admin" ON pricing_packages FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "packages_delete_admin" ON pricing_packages;
CREATE POLICY "packages_delete_admin" ON pricing_packages FOR DELETE
TO anon, authenticated USING (true);

-- Insert default pricing packages
INSERT INTO pricing_packages (name, tier, price, description, features, is_popular, sort_order) VALUES
('Silver', 'silver', 50000, 'Perfect for small events and intimate gatherings', ARRAY['2 hours coverage', '50 edited photos', 'Online gallery', 'Web resolution downloads'], false, 1),
('Gold', 'gold', 100000, 'Our most popular package for weddings and celebrations', ARRAY['5 hours coverage', '150 edited photos', 'Online gallery', 'High resolution downloads', '1 photographer', 'USB drive included'], true, 2),
('Premium', 'premium', 200000, 'Complete coverage for your most important events', ARRAY['Full day coverage', '300+ edited photos', 'Online gallery', 'High resolution downloads', '2 photographers', 'USB drive + Album', 'Drone coverage'], false, 3),
('Custom', 'custom', NULL, 'Tailored to your specific needs and vision', ARRAY['Custom hours', 'Custom deliverables', 'All premium features available', 'Personal consultation'], false, 4);

-- Insert sample testimonials
INSERT INTO testimonials (client_name, client_title, content, rating, is_featured) VALUES
('Sarah & James', 'Wedding Clients', 'Rub Shoots captured our wedding day perfectly. Every emotion, every smile, every tear was preserved beautifully. We could not be happier with the results!', 5, true),
('Michael Osei', 'Corporate Client', 'Professional, punctual, and produced outstanding photos for our company annual gala. The team was a pleasure to work with.', 5, true),
('Ama Mensah', 'Graduation Client', 'My graduation photos were absolutely stunning! The photographer made me feel so comfortable and the results exceeded my expectations.', 5, true),
('The Addo Family', 'Portrait Clients', 'We have been coming to Rub Shoots for family portraits for 3 years now. They always deliver amazing quality and make the experience fun for everyone.', 5, false);
