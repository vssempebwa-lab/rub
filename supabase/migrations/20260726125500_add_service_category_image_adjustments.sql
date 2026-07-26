UPDATE public.site_settings
SET value = jsonb_set(
  value,
  '{serviceCategoryImages}',
  COALESCE(value -> 'serviceCategoryImages', '{}'::jsonb),
  true
),
updated_at = now()
WHERE key = 'site_customization';

UPDATE public.site_content
SET value = jsonb_set(
  value,
  '{serviceCategoryImages}',
  COALESCE(value -> 'serviceCategoryImages', '{}'::jsonb),
  true
),
updated_at = now()
WHERE key = 'settings';
