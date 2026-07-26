CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_public" ON public.site_settings;
CREATE POLICY "site_settings_select_public" ON public.site_settings
FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "site_settings_insert_admin" ON public.site_settings;
CREATE POLICY "site_settings_insert_admin" ON public.site_settings
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));

DROP POLICY IF EXISTS "site_settings_update_admin" ON public.site_settings;
CREATE POLICY "site_settings_update_admin" ON public.site_settings
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));

ALTER TABLE public.pricing_packages
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS number_of_photographers text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS cta_label text;

ALTER TABLE public.pricing_packages
  ADD CONSTRAINT pricing_packages_positive_price
  CHECK (price IS NULL OR price > 0) NOT VALID;

UPDATE public.pricing_packages
SET
  duration = COALESCE(duration, 'Coverage details to confirm'),
  number_of_photographers = COALESCE(number_of_photographers, 'Team size to confirm'),
  notes = COALESCE(notes, NULL);

DROP POLICY IF EXISTS "packages_insert_admin" ON public.pricing_packages;
CREATE POLICY "packages_insert_admin" ON public.pricing_packages
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));

DROP POLICY IF EXISTS "packages_update_admin" ON public.pricing_packages;
CREATE POLICY "packages_update_admin" ON public.pricing_packages
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));

DROP POLICY IF EXISTS "packages_delete_admin" ON public.pricing_packages;
CREATE POLICY "packages_delete_admin" ON public.pricing_packages
FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));

INSERT INTO public.site_settings (key, value)
VALUES (
  'site_customization',
  '{
    "themeColors": {
      "primary": "#a65f2d",
      "accent": "#f3ede6",
      "secondary": "#ebe5dd",
      "ring": "#a65f2d"
    },
    "branding": {
      "logoUrl": "",
      "faviconUrl": "",
      "headingFont": "Playfair Display",
      "bodyFont": "Inter"
    },
    "seo": {
      "siteTitle": "Rub Shoots Photography | Professional Photography Services",
      "metaDescription": "Wedding, portrait, graduation, corporate, and event photography. Book your session today.",
      "openGraphImage": ""
    },
    "featureToggles": {
      "bookingInquiryForm": true,
      "homepageTestimonials": true,
      "publicPortfolioHighlights": true,
      "watermarkedPreviews": false
    },
    "watermarking": {
      "enabled": false,
      "text": "Rub Shoots",
      "logoUrl": ""
    },
    "serviceCategoryImages": {}
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

UPDATE public.pricing_packages
SET
  category = 'Introduction Ceremony',
  name = 'Silver Package',
  tier = 'silver',
  price = 3000000,
  duration = 'Full coverage - 12 hrs',
  number_of_photographers = '1 photographer, 2 videographers',
  features = ARRAY[
    '250 professionally edited photos',
    'Full video coverage',
    'Short cinematic highlight (montage)',
    'Drone coverage',
    'A4 photobook (standard)',
    'Flash disk (full delivery)',
    'Online gallery (sharing & downloads)',
    '2 premium A2 photo boards'
  ],
  notes = 'Full coverage is done on both sides (Bride & Groom). Captured with full-frame cameras and premium lights.',
  is_popular = false,
  sort_order = 1
WHERE tier = 'silver'
  AND sort_order = 1;

UPDATE public.pricing_packages
SET
  category = 'Introduction Ceremony',
  name = 'Gold Package',
  tier = 'gold',
  price = 4000000,
  duration = 'Full coverage - 15 hrs',
  number_of_photographers = '2 photographers, 2 videographers',
  features = ARRAY[
    '350 professionally edited photos',
    'Full video coverage',
    'Short cinematic highlight (montage)',
    'Drone coverage',
    'A3 photobook (standard)',
    'Hard drive (full delivery)',
    'Online gallery (sharing & downloads)',
    '2 premium A2 photo boards + 4 A3 boards'
  ],
  notes = 'Full coverage is done on both sides (Bride & Groom). Captured with full-frame cameras and premium lights.',
  is_popular = true,
  sort_order = 2
WHERE tier = 'gold'
  AND sort_order = 2;

UPDATE public.pricing_packages
SET
  category = 'Introduction Ceremony',
  name = 'Platinum Package',
  tier = 'premium',
  price = 5500000,
  duration = 'Full day coverage',
  number_of_photographers = '2 photographers, 3 videographers',
  features = ARRAY[
    '500+ professionally edited photos',
    'Full video coverage',
    'Short cinematic highlight (montage)',
    'Drone coverage',
    '3 A3 photobooks (extended)',
    'Hard drive (full delivery)',
    'Online gallery (sharing & downloads)',
    'Premium 2xA3, 2xA2, 1xA1 photo boards',
    'Same-day teaser video',
    'Live stream',
    'Memory lane'
  ],
  notes = 'Full coverage is done on both sides (Bride & Groom). Captured with full-frame cameras and premium lights.',
  is_popular = false,
  sort_order = 3
WHERE tier = 'premium'
  AND sort_order = 3;

DELETE FROM public.pricing_packages
WHERE tier = 'custom'
  AND name = 'Custom';

INSERT INTO public.pricing_packages (
  category, name, tier, price, duration, number_of_photographers, description,
  features, notes, is_popular, sort_order
)
VALUES
  ('Wedding', 'Silver Package', 'silver', 3000000, 'Full coverage - 12 hrs', '1 photographer, 2 videographers', 'Wedding day coverage using the Mikolo Silver structure.', ARRAY['250 professionally edited photos', 'Full video coverage', 'Short cinematic highlight (montage)', 'Drone coverage', 'A4 photobook (standard)', 'Flash disk (full delivery)', 'Online gallery (sharing & downloads)', '2 premium A2 photo boards'], 'Full coverage is done on both sides (Bride & Groom). Captured with full-frame cameras and premium lights.', false, 4),
  ('Wedding', 'Gold Package', 'gold', 4000000, 'Full coverage - 15 hrs', '2 photographers, 2 videographers', 'Wedding day coverage using the Mikolo Gold structure.', ARRAY['350 professionally edited photos', 'Full video coverage', 'Short cinematic highlight (montage)', 'Drone coverage', 'A3 photobook (standard)', 'Hard drive (full delivery)', 'Online gallery (sharing & downloads)', '2 premium A2 photo boards + 4 A3 boards'], 'Full coverage is done on both sides (Bride & Groom). Captured with full-frame cameras and premium lights.', false, 5),
  ('Wedding', 'Platinum Package', 'premium', 5500000, 'Full day coverage', '2 photographers, 3 videographers', 'Wedding day coverage using the Mikolo Platinum structure.', ARRAY['500+ professionally edited photos', 'Full video coverage', 'Short cinematic highlight (montage)', 'Drone coverage', '3 A3 photobooks (extended)', 'Hard drive (full delivery)', 'Online gallery (sharing & downloads)', 'Premium 2xA3, 2xA2, 1xA1 photo boards', 'Same-day teaser video', 'Live stream', 'Memory lane'], 'Full coverage is done on both sides (Bride & Groom). Captured with full-frame cameras and premium lights.', false, 6),
  ('Photoshoots', 'Indoor Studio Session', 'custom', NULL, 'To confirm', 'To confirm', 'Indoor Photoshoot', ARRAY['Studio lighting setup', 'Professionally edited photos', 'Online gallery for sharing & downloads'], NULL, false, 7),
  ('Photoshoots', 'Outdoor Lifestyle Session', 'custom', NULL, 'To confirm', 'To confirm', 'Outdoor Photoshoot', ARRAY['Location-based creative direction', 'Professionally edited photos', 'Online gallery for sharing & downloads'], NULL, false, 8),
  ('Photoshoots', 'Family & Newborn Portraits', 'custom', NULL, 'To confirm', 'To confirm', 'Portrait - Family & Newborn', ARRAY['Gentle guided portrait session', 'Professionally edited photos', 'Online gallery for sharing & downloads'], NULL, false, 9),
  ('Photoshoots', 'Professional Headshots', 'custom', NULL, 'To confirm', 'To confirm', 'Portrait - Headshots', ARRAY['Clean portrait lighting', 'Professionally edited photos', 'Web and profile-ready image delivery'], NULL, false, 10),
  ('Photoshoots', 'Boudoir Portrait Session', 'custom', NULL, 'To confirm', 'To confirm', 'Portrait - Boudoir', ARRAY['Private guided portrait session', 'Professionally edited photos', 'Secure online gallery delivery'], NULL, false, 11),
  ('Photoshoots', 'Commercial Brand Session', 'custom', NULL, 'To confirm', 'To confirm', 'Commercial Photoshoot', ARRAY['Product, team, or campaign imagery', 'Professionally edited photos', 'Usage needs confirmed before booking'], 'Confirm usage/licensing terms before booking.', false, 12)
ON CONFLICT DO NOTHING;
