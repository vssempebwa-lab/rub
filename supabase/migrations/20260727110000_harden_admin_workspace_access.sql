CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  success boolean NOT NULL,
  reason text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_login_attempts_select_admin" ON public.admin_login_attempts;
CREATE POLICY "admin_login_attempts_select_admin" ON public.admin_login_attempts
FOR SELECT TO authenticated
USING (public.is_admin());

ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "site_content_insert_authenticated" ON public.site_content;
DROP POLICY IF EXISTS "site_content_update_authenticated" ON public.site_content;
DROP POLICY IF EXISTS "site_content_delete_authenticated" ON public.site_content;
DROP POLICY IF EXISTS "site_content_insert_admin" ON public.site_content;
DROP POLICY IF EXISTS "site_content_update_admin" ON public.site_content;
DROP POLICY IF EXISTS "site_content_delete_admin" ON public.site_content;

CREATE POLICY "site_content_insert_admin" ON public.site_content
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "site_content_update_admin" ON public.site_content
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "site_content_delete_admin" ON public.site_content
FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "site_faqs_insert_authenticated" ON public.site_faqs;
DROP POLICY IF EXISTS "site_faqs_update_authenticated" ON public.site_faqs;
DROP POLICY IF EXISTS "site_faqs_delete_authenticated" ON public.site_faqs;
DROP POLICY IF EXISTS "site_faqs_insert_admin" ON public.site_faqs;
DROP POLICY IF EXISTS "site_faqs_update_admin" ON public.site_faqs;
DROP POLICY IF EXISTS "site_faqs_delete_admin" ON public.site_faqs;

CREATE POLICY "site_faqs_insert_admin" ON public.site_faqs
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "site_faqs_update_admin" ON public.site_faqs
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "site_faqs_delete_admin" ON public.site_faqs
FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "testimonials_insert_admin" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_update_admin" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_delete_admin" ON public.testimonials;

CREATE POLICY "testimonials_insert_admin" ON public.testimonials
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "testimonials_update_admin" ON public.testimonials
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "testimonials_delete_admin" ON public.testimonials
FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
DROP POLICY IF EXISTS "categories_update_admin" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON public.categories;

CREATE POLICY "categories_insert_admin" ON public.categories
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin" ON public.categories
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "categories_delete_admin" ON public.categories
FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "services_insert_admin" ON public.services;
DROP POLICY IF EXISTS "services_update_admin" ON public.services;
DROP POLICY IF EXISTS "services_delete_admin" ON public.services;

CREATE POLICY "services_insert_admin" ON public.services
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "services_update_admin" ON public.services
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "services_delete_admin" ON public.services
FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "packages_insert_admin" ON public.pricing_packages;
DROP POLICY IF EXISTS "packages_update_admin" ON public.pricing_packages;
DROP POLICY IF EXISTS "packages_delete_admin" ON public.pricing_packages;

CREATE POLICY "packages_insert_admin" ON public.pricing_packages
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "packages_update_admin" ON public.pricing_packages
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "packages_delete_admin" ON public.pricing_packages
FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "site_settings_insert_admin" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_update_admin" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_delete_admin" ON public.site_settings;

CREATE POLICY "site_settings_insert_admin" ON public.site_settings
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "site_settings_update_admin" ON public.site_settings
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "site_settings_delete_admin" ON public.site_settings
FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "team_members_insert_admin" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update_admin" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete_admin" ON public.team_members;

CREATE POLICY "team_members_insert_admin" ON public.team_members
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "team_members_update_admin" ON public.team_members
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "team_members_delete_admin" ON public.team_members
FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "website_assets_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "website_assets_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "website_assets_authenticated_delete" ON storage.objects;

CREATE POLICY "website_assets_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'website-assets'
  AND public.is_admin()
);

CREATE POLICY "website_assets_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'website-assets'
  AND public.is_admin()
)
WITH CHECK (
  bucket_id = 'website-assets'
  AND public.is_admin()
);

CREATE POLICY "website_assets_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'website-assets'
  AND public.is_admin()
);
