-- The dashboard currently supports unsigned photographer workspace access.
-- Allow event photo objects to render in photographer previews for any
-- object stored under an existing event id folder.

DROP POLICY IF EXISTS "photos_storage_public_read_active_events" ON storage.objects;
CREATE POLICY "photos_storage_public_read_active_events"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id::text = (storage.foldername(storage.objects.name))[1]
  )
);
