-- Public image bucket used by the Website Manager's image uploader.
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "website_assets_public_read" ON storage.objects;
CREATE POLICY "website_assets_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-assets');

DROP POLICY IF EXISTS "website_assets_authenticated_upload" ON storage.objects;
CREATE POLICY "website_assets_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'website-assets'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "website_assets_authenticated_update" ON storage.objects;
CREATE POLICY "website_assets_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'website-assets'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  bucket_id = 'website-assets'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
