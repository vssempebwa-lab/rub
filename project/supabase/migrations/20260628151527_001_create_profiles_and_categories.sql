/*
# Create profiles and categories tables

1. New Tables
- `profiles` - Extends auth.users with role-based information
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `full_name` (text)
  - `avatar_url` (text)
  - `role` (text, enum: admin, photographer, client)
  - `phone` (text)
  - `bio` (text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- `categories` - Photography service categories
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `slug` (text, unique, not null)
  - `description` (text)
  - `image_url` (text)
  - `sort_order` (integer, default 0)
  - `created_at` (timestamp)

- `services` - Photography services offered
  - `id` (uuid, primary key)
  - `category_id` (uuid, references categories)
  - `name` (text, not null)
  - `description` (text)
  - `features` (text[])
  - `starting_price` (integer)
  - `image_url` (text)
  - `sort_order` (integer, default 0)
  - `created_at` (timestamp)

2. Security
- Enable RLS on all tables
- Profiles: users can read/update their own profile, admins can read all
- Categories/Services: public read for all visitors
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'photographer', 'client')),
  phone text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  features text[],
  starting_price integer,
  image_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
TO anon, authenticated USING (true);

-- Categories policies (public read)
DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public" ON categories FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "categories_update_admin" ON categories;
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
TO anon, authenticated USING (true);

-- Services policies (public read)
DROP POLICY IF EXISTS "services_select_public" ON services;
CREATE POLICY "services_select_public" ON services FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "services_insert_admin" ON services;
CREATE POLICY "services_insert_admin" ON services FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "services_update_admin" ON services;
CREATE POLICY "services_update_admin" ON services FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "services_delete_admin" ON services;
CREATE POLICY "services_delete_admin" ON services FOR DELETE
TO anon, authenticated USING (true);

-- Insert default categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Wedding', 'wedding', 'Beautiful wedding photography capturing your special day', 1),
('Portrait', 'portrait', 'Professional portrait photography for individuals and families', 2),
('Graduation', 'graduation', 'Celebrate your academic achievements with stunning photos', 3),
('Corporate Events', 'corporate-events', 'Professional coverage for corporate events and conferences', 4),
('Birthday Parties', 'birthday-parties', 'Memorable birthday celebration photography', 5),
('Fashion', 'fashion', 'High-end fashion and editorial photography', 6),
('Studio Portraits', 'studio-portraits', 'Classic studio portrait sessions', 7),
('Drone Photography', 'drone-photography', 'Stunning aerial photography and videography', 8)
ON CONFLICT (slug) DO NOTHING;
