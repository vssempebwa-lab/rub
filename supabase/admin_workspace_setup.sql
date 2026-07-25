create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text unique,
  phone text,
  role text default 'client',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists role text default 'client',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_id uuid,
  photographer_id uuid,
  category_id uuid,
  event_date date,
  location text,
  description text,
  cover_image_url text,
  gallery_url text,
  qr_code_url text,
  status text default 'draft',
  password text,
  expiration_date timestamptz,
  download_limit integer default 0,
  allow_favorites boolean default true,
  allow_downloads boolean default true,
  allow_comments boolean default true,
  is_public boolean default false,
  allow_uploads boolean default false,
  allow_face_scan boolean default false,
  allow_all_photos boolean default true,
  allow_all_photos_access_code text,
  category_password_protection boolean default false,
  category_protection_password text,
  invite_only boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.events
  add column if not exists cover_image_url text,
  add column if not exists gallery_url text,
  add column if not exists qr_code_url text,
  add column if not exists password text,
  add column if not exists expiration_date timestamptz,
  add column if not exists is_public boolean default false,
  add column if not exists allow_uploads boolean default false,
  add column if not exists allow_face_scan boolean default false,
  add column if not exists allow_all_photos boolean default true,
  add column if not exists allow_all_photos_access_code text,
  add column if not exists category_password_protection boolean default false,
  add column if not exists category_protection_password text,
  add column if not exists invite_only boolean default false;

create unique index if not exists events_gallery_url_key
  on public.events(gallery_url)
  where gallery_url is not null;

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid,
  event_id uuid references public.events(id) on delete cascade,
  url text,
  thumbnail_url text,
  watermarked_url text,
  filename text,
  file_size integer,
  width integer,
  height integer,
  mime_type text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text,
  client_phone text,
  event_date date,
  event_type text,
  package_name text,
  message text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  note text not null,
  status text default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  client_email text,
  client_phone text,
  subject text,
  message text,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  client_email text,
  event_id uuid references public.events(id) on delete set null,
  invoice_number text,
  quote_number text,
  type text default 'invoice',
  amount numeric(12,2) default 0,
  currency text default 'INR',
  status text default 'draft',
  due_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  category text,
  amount numeric(12,2) default 0,
  currency text default 'INR',
  expense_date date default current_date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  photo_id uuid references public.photos(id) on delete cascade,
  visitor_name text,
  visitor_email text,
  created_at timestamptz default now()
);

create table if not exists public.invited_guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_email text not null,
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  created_at timestamptz default now(),
  unique(event_id, guest_email)
);

create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  maintenance_mode boolean default false,
  default_event_public boolean default false,
  auto_approve_bookings boolean default false,
  max_upload_size_mb integer default 50,
  storage_limit_mb integer default 500,
  media_limit integer default 1200,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_profile_id uuid,
  referred_email text,
  reward_amount numeric(12,2) default 0,
  currency text default 'INR',
  status text default 'pending',
  created_at timestamptz default now()
);

create index if not exists idx_events_created_at on public.events(created_at desc);
create index if not exists idx_events_event_date on public.events(event_date);
create index if not exists idx_photos_event_id on public.photos(event_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_event_date on public.bookings(event_date);
create index if not exists idx_inquiries_status on public.inquiries(status);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_expenses_event_id on public.expenses(event_id);
create index if not exists idx_invited_guests_event_id on public.invited_guests(event_id);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.bookings enable row level security;
alter table public.admin_notes enable row level security;
alter table public.inquiries enable row level security;
alter table public.invoices enable row level security;
alter table public.expenses enable row level security;
alter table public.downloads enable row level security;
alter table public.invited_guests enable row level security;
alter table public.admin_settings enable row level security;
alter table public.referrals enable row level security;

drop policy if exists "admin_profiles_access" on public.profiles;
create policy "admin_profiles_access" on public.profiles
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_events_access" on public.events;
create policy "admin_events_access" on public.events
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_photos_access" on public.photos;
create policy "admin_photos_access" on public.photos
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_bookings_access" on public.bookings;
create policy "admin_bookings_access" on public.bookings
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_notes_access" on public.admin_notes;
create policy "admin_notes_access" on public.admin_notes
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_inquiries_access" on public.inquiries;
create policy "admin_inquiries_access" on public.inquiries
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_invoices_access" on public.invoices;
create policy "admin_invoices_access" on public.invoices
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_expenses_access" on public.expenses;
create policy "admin_expenses_access" on public.expenses
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_downloads_access" on public.downloads;
create policy "admin_downloads_access" on public.downloads
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_invited_guests_access" on public.invited_guests;
create policy "admin_invited_guests_access" on public.invited_guests
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_settings_access" on public.admin_settings;
create policy "admin_settings_access" on public.admin_settings
for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin_referrals_access" on public.referrals;
create policy "admin_referrals_access" on public.referrals
for all to anon, authenticated using (true) with check (true);

insert into public.admin_settings (
  maintenance_mode,
  default_event_public,
  auto_approve_bookings,
  max_upload_size_mb,
  storage_limit_mb,
  media_limit
)
select false, false, false, 50, 500, 1200
where not exists (select 1 from public.admin_settings);

insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true)
on conflict (id) do update set public = true;

drop policy if exists "event_media_public_select" on storage.objects;
create policy "event_media_public_select"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'event-media');

drop policy if exists "event_media_public_insert" on storage.objects;
create policy "event_media_public_insert"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'event-media');

drop policy if exists "event_media_public_update" on storage.objects;
create policy "event_media_public_update"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'event-media')
with check (bucket_id = 'event-media');

drop policy if exists "event_media_public_delete" on storage.objects;
create policy "event_media_public_delete"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'event-media');
