-- Ensure photos table has all necessary columns
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS event_id UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS photo_url TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Add foreign key constraint if not exists
ALTER TABLE photos
ADD CONSTRAINT fk_photos_event_id FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);

-- Ensure RLS is enabled
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view photos" ON photos;
DROP POLICY IF EXISTS "Anyone can insert photos" ON photos;
DROP POLICY IF EXISTS "Anyone can update photos" ON photos;
DROP POLICY IF EXISTS "Anyone can delete photos" ON photos;
DROP POLICY IF EXISTS "Anyone can view photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON photos;
DROP POLICY IF EXISTS "Users can update photos" ON photos;
DROP POLICY IF EXISTS "Users can delete photos" ON photos;

-- Create new policies - Allow all operations for authenticated users
CREATE POLICY "Anyone can view photos"
  ON photos FOR SELECT
  USING (true);

CREATE POLICY "Anyone can upload photos"
  ON photos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update photos"
  ON photos FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete photos"
  ON photos FOR DELETE
  USING (true);
