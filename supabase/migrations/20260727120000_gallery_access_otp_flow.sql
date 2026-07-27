ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS share_token text;

UPDATE public.events
SET share_token = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE share_token IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS events_share_token_key
ON public.events (share_token)
WHERE share_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.gallery_access_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  full_name text NOT NULL,
  otp_code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gallery_access_otps_event_phone_created_idx
ON public.gallery_access_otps (event_id, phone_number, created_at DESC);

CREATE TABLE IF NOT EXISTS public.gallery_access_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  otp_id uuid REFERENCES public.gallery_access_otps(id) ON DELETE SET NULL,
  access_token_hash text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gallery_access_sessions_event_expires_idx
ON public.gallery_access_sessions (event_id, expires_at DESC);

ALTER TABLE public.gallery_access_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_access_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_access_otps_admin_select" ON public.gallery_access_otps;
CREATE POLICY "gallery_access_otps_admin_select" ON public.gallery_access_otps
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'photographer')
  )
);

DROP POLICY IF EXISTS "gallery_access_sessions_admin_select" ON public.gallery_access_sessions;
CREATE POLICY "gallery_access_sessions_admin_select" ON public.gallery_access_sessions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'photographer')
  )
);
