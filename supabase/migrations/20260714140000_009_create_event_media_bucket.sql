-- Create event-media storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-media', 'event-media', true)
ON CONFLICT DO NOTHING;

-- Storage bucket policies for event-media
-- Allow authenticated users to read/select files
CREATE POLICY "Authenticated users can read event media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to event-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update event-media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'event-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete event-media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-media' AND auth.role() = 'authenticated');

-- Allow public access to read files (optional - for public galleries)
CREATE POLICY "Public can read event media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-media');
