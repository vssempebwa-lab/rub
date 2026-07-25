-- Allow the unsigned photographer workspace flow to upload, update, and delete
-- objects in the photos bucket. Public reads remain gated by events.is_public
-- in the 012 photos bucket migration.

DROP POLICY IF EXISTS "photos_storage_photographer_insert_own_events" ON storage.objects;
DROP POLICY IF EXISTS "photos_storage_photographer_update_own_events" ON storage.objects;
DROP POLICY IF EXISTS "photos_storage_photographer_delete_own_events" ON storage.objects;

DROP POLICY IF EXISTS "photos_storage_unsigned_insert" ON storage.objects;
CREATE POLICY "photos_storage_unsigned_insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id::text = (storage.foldername(name))[1]
  )
);

DROP POLICY IF EXISTS "photos_storage_unsigned_update" ON storage.objects;
CREATE POLICY "photos_storage_unsigned_update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id::text = (storage.foldername(name))[1]
  )
)
WITH CHECK (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id::text = (storage.foldername(name))[1]
  )
);

DROP POLICY IF EXISTS "photos_storage_unsigned_delete" ON storage.objects;
CREATE POLICY "photos_storage_unsigned_delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id::text = (storage.foldername(name))[1]
  )
);
