ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

UPDATE public.team_members
SET photo_url = COALESCE(photo_url, image_url)
WHERE photo_url IS NULL
  AND image_url IS NOT NULL;

UPDATE public.team_members
SET
  bio = COALESCE(bio, 'Ruben leads the creative direction for Rub Shoots, shaping each session with calm confidence and a strong eye for emotion. He specializes in weddings, introductions, and portraits with a clean, timeless finish.'),
  social_links = COALESCE(social_links, '{"instagram": "", "tiktok": ""}'::jsonb)
WHERE name = 'Ruben Mensah';

UPDATE public.team_members
SET
  bio = COALESCE(bio, 'Ama brings a thoughtful portrait sensibility to the team, helping clients feel natural in front of the camera. Her work focuses on connection, flattering light, and elegant storytelling.'),
  social_links = COALESCE(social_links, '{"instagram": "", "tiktok": ""}'::jsonb)
WHERE name = 'Ama Darko';

UPDATE public.team_members
SET
  bio = COALESCE(bio, 'Kofi documents fast-moving events with patience, awareness, and a sharp instinct for meaningful moments. He is especially strong at capturing candid emotion without interrupting the celebration.'),
  social_links = COALESCE(social_links, '{"instagram": "", "tiktok": ""}'::jsonb)
WHERE name = 'Kofi Asante';

INSERT INTO public.team_members (name, role, bio, photo_url, image_url, social_links, sort_order, is_active)
SELECT *
FROM (VALUES
  (
    'Grace Nakato',
    'Videographer',
    'Grace creates cinematic films that preserve the pace, sound, and feeling of each celebration. She works closely with the photo team so video coverage feels effortless and complete.',
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
    '{"instagram": "", "tiktok": ""}'::jsonb,
    4,
    true
  ),
  (
    'Daniel Okello',
    'Photo Editor',
    'Daniel shapes the final gallery with consistent color, polished retouching, and a careful respect for each photographer''s intent. His editing gives every delivery the warm Rub Shoots finish.',
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
    '{"instagram": "", "tiktok": ""}'::jsonb,
    5,
    true
  ),
  (
    'Miriam Achieng',
    'Studio Manager',
    'Miriam keeps bookings, timelines, and client communication running smoothly from inquiry to delivery. She makes sure every session is organized, welcoming, and easy to enjoy.',
    'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=600',
    '{"instagram": "", "tiktok": ""}'::jsonb,
    6,
    true
  )
) AS v(name, role, bio, photo_url, image_url, social_links, sort_order, is_active)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.team_members
  WHERE team_members.name = v.name
);

ALTER TABLE public.team_members
  ALTER COLUMN social_links SET DEFAULT '{}'::jsonb;

DROP POLICY IF EXISTS "team_members_select_public" ON public.team_members;
CREATE POLICY "team_members_select_public" ON public.team_members
FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "team_members_insert_authenticated" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update_authenticated" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete_authenticated" ON public.team_members;

DROP POLICY IF EXISTS "team_members_insert_admin" ON public.team_members;
CREATE POLICY "team_members_insert_admin" ON public.team_members
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));

DROP POLICY IF EXISTS "team_members_update_admin" ON public.team_members;
CREATE POLICY "team_members_update_admin" ON public.team_members
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

DROP POLICY IF EXISTS "team_members_delete_admin" ON public.team_members;
CREATE POLICY "team_members_delete_admin" ON public.team_members
FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));
