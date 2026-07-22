-- Create the event-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at)
VALUES (
  'event-media',
  'event-media',
  true,
  52428800,  -- 50MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'],
  NOW()
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for event-media to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read event media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to event-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event-media" ON storage.objects;
DROP POLICY IF EXISTS "Public can read event media" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated write access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access" ON storage.objects;

-- Create new policies for event-media bucket
CREATE POLICY "Public read event-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-media');

CREATE POLICY "Authenticated upload to event-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-media');

CREATE POLICY "Authenticated update event-media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'event-media');

CREATE POLICY "Authenticated delete event-media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-media');
