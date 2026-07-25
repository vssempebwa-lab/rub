ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS event_type text,
ADD COLUMN IF NOT EXISTS photoshoot_category text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'events_event_type_check'
      AND conrelid = 'public.events'::regclass
  ) THEN
    ALTER TABLE public.events
    ADD CONSTRAINT events_event_type_check
    CHECK (event_type IS NULL OR event_type IN ('coverage', 'photoshoot'));
  END IF;
END $$;
