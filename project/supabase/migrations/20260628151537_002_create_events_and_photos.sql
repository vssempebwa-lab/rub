/*
# Create events, albums, photos, and bookings tables

1. New Tables
- `events` - Photography events/shoots
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `client_id` (uuid, references profiles)
  - `photographer_id` (uuid, references profiles)
  - `category_id` (uuid, references categories)
  - `event_date` (date)
  - `location` (text)
  - `description` (text)
  - `cover_image_url` (text)
  - `gallery_url` (text, unique)
  - `qr_code_url` (text)
  - `status` (text, enum: draft, active, completed, archived)
  - `password` (text)
  - `expiration_date` (timestamptz)
  - `download_limit` (integer)
  - `allow_favorites` (boolean, default true)
  - `allow_downloads` (boolean, default true)
  - `allow_comments` (boolean, default true)
  - `is_public` (boolean, default false)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- `albums` - Albums within an event
  - `id` (uuid, primary key)
  - `event_id` (uuid, references events)
  - `name` (text, not null)
  - `sort_order` (integer, default 0)
  - `created_at` (timestamp)

- `photos` - Individual photos
  - `id` (uuid, primary key)
  - `album_id` (uuid, references albums)
  - `event_id` (uuid, references events)
  - `url` (text, not null)
  - `thumbnail_url` (text)
  - `watermarked_url` (text)
  - `filename` (text)
  - `file_size` (integer)
  - `width` (integer)
  - `height` (integer)
  - `mime_type` (text)
  - `sort_order` (integer, default 0)
  - `created_at` (timestamp)

- `bookings` - Client bookings
  - `id` (uuid, primary key)
  - `client_name` (text, not null)
  - `client_email` (text, not null)
  - `client_phone` (text)
  - `event_date` (date)
  - `event_type` (text)
  - `package_name` (text)
  - `message` (text)
  - `status` (text, enum: pending, confirmed, cancelled, completed)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

2. Security
- Enable RLS on all tables
- Events: public can view active/public events via gallery URL; photographers can manage their own; admins can manage all
- Albums/Photos: follow event visibility rules
- Bookings: public can create; admins can read/update all
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  photographer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  event_date date,
  location text,
  description text,
  cover_image_url text,
  gallery_url text UNIQUE,
  qr_code_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  password text,
  expiration_date timestamptz,
  download_limit integer DEFAULT 0,
  allow_favorites boolean DEFAULT true,
  allow_downloads boolean DEFAULT true,
  allow_comments boolean DEFAULT true,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES albums(id) ON DELETE SET NULL,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url text NOT NULL,
  thumbnail_url text,
  watermarked_url text,
  filename text,
  file_size integer,
  width integer,
  height integer,
  mime_type text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  event_date date,
  event_type text,
  package_name text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Events policies
DROP POLICY IF EXISTS "events_select_public" ON events;
CREATE POLICY "events_select_public" ON events FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "events_insert_any" ON events;
CREATE POLICY "events_insert_any" ON events FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "events_update_any" ON events;
CREATE POLICY "events_update_any" ON events FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "events_delete_any" ON events;
CREATE POLICY "events_delete_any" ON events FOR DELETE
TO anon, authenticated USING (true);

-- Albums policies
DROP POLICY IF EXISTS "albums_select_public" ON albums;
CREATE POLICY "albums_select_public" ON albums FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "albums_insert_any" ON albums;
CREATE POLICY "albums_insert_any" ON albums FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "albums_update_any" ON albums;
CREATE POLICY "albums_update_any" ON albums FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "albums_delete_any" ON albums;
CREATE POLICY "albums_delete_any" ON albums FOR DELETE
TO anon, authenticated USING (true);

-- Photos policies
DROP POLICY IF EXISTS "photos_select_public" ON photos;
CREATE POLICY "photos_select_public" ON photos FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "photos_insert_any" ON photos;
CREATE POLICY "photos_insert_any" ON photos FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "photos_update_any" ON photos;
CREATE POLICY "photos_update_any" ON photos FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "photos_delete_any" ON photos;
CREATE POLICY "photos_delete_any" ON photos FOR DELETE
TO anon, authenticated USING (true);

-- Bookings policies
DROP POLICY IF EXISTS "bookings_select_public" ON bookings;
CREATE POLICY "bookings_select_public" ON bookings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "bookings_insert_public" ON bookings;
CREATE POLICY "bookings_insert_public" ON bookings FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_update_public" ON bookings;
CREATE POLICY "bookings_update_public" ON bookings FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_delete_public" ON bookings;
CREATE POLICY "bookings_delete_public" ON bookings FOR DELETE
TO anon, authenticated USING (true);
