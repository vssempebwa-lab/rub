-- Storage bucket used by app/dashboard/photographer/upload.
-- New uploads are stored as: {event_id}/{generated_filename.ext}
-- That first folder segment lets storage policies map an object back to its event.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'photos',
  'photos',
  false,
  26214400,
  ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];

DROP POLICY IF EXISTS "photos_storage_public_read_active_events" ON storage.objects;
CREATE POLICY "photos_storage_public_read_active_events"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id::text = (storage.foldername(name))[1]
      AND e.is_public = true
  )
);

DROP POLICY IF EXISTS "photos_storage_photographer_insert_own_events" ON storage.objects;
CREATE POLICY "photos_storage_photographer_insert_own_events"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    WHERE e.id::text = (storage.foldername(name))[1]
      AND (
        e.photographer_id = auth.uid()
        OR p.role = 'admin'
      )
  )
);

DROP POLICY IF EXISTS "photos_storage_photographer_update_own_events" ON storage.objects;
CREATE POLICY "photos_storage_photographer_update_own_events"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    WHERE e.id::text = (storage.foldername(name))[1]
      AND (
        e.photographer_id = auth.uid()
        OR p.role = 'admin'
      )
  )
)
WITH CHECK (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    WHERE e.id::text = (storage.foldername(name))[1]
      AND (
        e.photographer_id = auth.uid()
        OR p.role = 'admin'
      )
  )
);

DROP POLICY IF EXISTS "photos_storage_photographer_delete_own_events" ON storage.objects;
CREATE POLICY "photos_storage_photographer_delete_own_events"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    WHERE e.id::text = (storage.foldername(name))[1]
      AND (
        e.photographer_id = auth.uid()
        OR p.role = 'admin'
      )
  )
);
