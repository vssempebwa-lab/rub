-- Fix photos table RLS policies
-- First, check what columns exist and add any missing ones if needed

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload photos" ON photos;
DROP POLICY IF EXISTS "Anyone can view photos" ON photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON photos;

-- Create new simplified policies
CREATE POLICY "Anyone can view photos"
  ON photos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload photos"
  ON photos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update photos"
  ON photos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete photos"
  ON photos FOR DELETE
  USING (auth.role() = 'authenticated');
