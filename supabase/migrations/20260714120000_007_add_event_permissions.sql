-- Add event permission columns
ALTER TABLE events
ADD COLUMN IF NOT EXISTS allow_uploads BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_face_scan BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_all_photos BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_all_photos_access_code TEXT,
ADD COLUMN IF NOT EXISTS category_password_protection BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS category_protection_password TEXT,
ADD COLUMN IF NOT EXISTS invite_only BOOLEAN DEFAULT false;

-- Create invited_guests table for invite-only access
CREATE TABLE IF NOT EXISTS invited_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_email TEXT NOT NULL,
  invited_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, guest_email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invited_guests_event_id ON invited_guests(event_id);
CREATE INDEX IF NOT EXISTS idx_invited_guests_email ON invited_guests(guest_email);

-- Add RLS policies for invited_guests table
ALTER TABLE invited_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photographers can manage invited guests for their events"
  ON invited_guests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = invited_guests.event_id 
      AND events.photographer_id = auth.uid()
    )
  );

CREATE POLICY "Invited guests can view their own invitations"
  ON invited_guests FOR SELECT
  USING (guest_email = auth.jwt() ->> 'email');
