UPDATE public.site_content
SET value = jsonb_set(
  jsonb_set(value, '{hero,imageFit}', COALESCE(value #> '{hero,imageFit}', '"cover"'::jsonb), true),
  '{hero,imagePosition}', COALESCE(value #> '{hero,imagePosition}', '"center"'::jsonb), true
),
updated_at = now()
WHERE key = 'home';
