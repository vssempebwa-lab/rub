-- Fix ambiguous "name" references in photos storage policies.
-- The previous policies resolved name as public.events.name inside EXISTS,
-- not storage.objects.name, so object uploads could not match the event id
-- folder prefix.

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
      AND e.is_public = true
  )
);

DROP POLICY IF EXISTS "photos_storage_unsigned_insert" ON storage.objects;
CREATE POLICY "photos_storage_unsigned_insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id::text = (storage.foldername(storage.objects.name))[1]
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
    WHERE e.id::text = (storage.foldername(storage.objects.name))[1]
  )
)
WITH CHECK (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id::text = (storage.foldername(storage.objects.name))[1]
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
    WHERE e.id::text = (storage.foldername(storage.objects.name))[1]
  )
);
