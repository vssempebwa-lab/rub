/**
 * Seeds the Rub Shoots database with demo data for all app use cases.
 * Run: npm run seed
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const content = readFileSync('.env.local', 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key] = rest.join('=');
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const PASSWORD = 'RubShoots2026!';

const USERS = [
  { email: 'test@rubshoots.com', fullName: 'Test Admin', role: 'admin' },
  { email: 'photographer@rubshoots.com', fullName: 'Kwame Asante', role: 'photographer', phone: '+256 772 111 223', bio: 'Lead wedding and portrait photographer with 8 years of experience.' },
  { email: 'client1@rubshoots.com', fullName: 'Sarah Addo', role: 'client', phone: '+256 700 555 123' },
  { email: 'client2@rubshoots.com', fullName: 'Michael Osei', role: 'client', phone: '+256 778 888 456' },
  { email: 'client3@rubshoots.com', fullName: 'Ama Mensah', role: 'client', phone: '+256 753 333 987' },
];

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
  'https://images.unsplash.com/photo-1465497424747-74e657164bc0?w=1200&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80',
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc7916e?w=1200&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80',
  'https://images.unsplash.com/photo-1529636798458-921d380c01df?w=1200&q=80',
  'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=80',
  'https://images.unsplash.com/photo-1583939003609-d79e6864da70?w=1200&q=80',
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
];

async function ensureUser({ email, fullName, role, phone, bio }) {
  let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password: PASSWORD });

  if (signInError) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password: PASSWORD });
    if (signUpError) throw new Error(`Failed to create ${email}: ${signUpError.message}`);
    signInData = signUpData;
  }

  const userId = signInData.user?.id;
  if (!userId) throw new Error(`No user id for ${email}`);

  const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();

  if (!existing) {
    const { error } = await supabase.from('profiles').insert([{
      id: userId,
      email,
      full_name: fullName,
      role,
      phone: phone ?? null,
      bio: bio ?? null,
    }]);
    if (error) throw new Error(`Profile insert failed for ${email}: ${error.message}`);
  } else {
    await supabase.from('profiles').update({
      full_name: fullName,
      role,
      phone: phone ?? null,
      bio: bio ?? null,
    }).eq('id', userId);
  }

  return userId;
}

async function getCategories() {
  const { data, error } = await supabase.from('categories').select('id, slug, name').order('sort_order');
  if (error) throw error;
  return data ?? [];
}

async function seedServices(categories) {
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const services = [
    { category_id: bySlug.wedding, name: 'Full Wedding Coverage', description: 'Complete wedding day photography from preparation to reception.', features: ['8+ hours coverage', '2 photographers', '400+ edited photos', 'Online gallery', 'Engagement session'], starting_price: 150000, sort_order: 1 },
    { category_id: bySlug.wedding, name: 'Intimate Wedding', description: 'Perfect for small ceremonies and courthouse weddings.', features: ['3 hours coverage', '1 photographer', '100 edited photos', 'Online gallery'], starting_price: 60000, sort_order: 2 },
    { category_id: bySlug.portrait, name: 'Individual Portrait Session', description: 'Professional headshots and personal branding photos.', features: ['1 hour session', '20 edited photos', 'Studio or outdoor', 'Wardrobe guidance'], starting_price: 35000, sort_order: 3 },
    { category_id: bySlug.portrait, name: 'Family Portrait Session', description: 'Capture your family moments in a relaxed setting.', features: ['1.5 hour session', '30 edited photos', 'Up to 6 people', 'Location of choice'], starting_price: 45000, sort_order: 4 },
    { category_id: bySlug.graduation, name: 'Graduation Package', description: 'Celebrate your academic achievement with stunning portraits.', features: ['45 min session', '15 edited photos', 'Cap & gown shots', 'Campus locations'], starting_price: 25000, sort_order: 5 },
    { category_id: bySlug['corporate-events'], name: 'Corporate Event Coverage', description: 'Professional documentation for conferences, galas, and launches.', features: ['Flexible hours', 'Same-day previews', 'Commercial usage rights', 'Team of photographers'], starting_price: 80000, sort_order: 6 },
    { category_id: bySlug['birthday-parties'], name: 'Birthday Party Package', description: 'Fun and candid coverage of your celebration.', features: ['3 hours coverage', '80 edited photos', 'Candid & posed shots', 'Online sharing gallery'], starting_price: 40000, sort_order: 7 },
    { category_id: bySlug.fashion, name: 'Fashion Editorial', description: 'High-end fashion and lookbook photography.', features: ['Half or full day', 'Retouching included', 'Creative direction', 'Studio lighting'], starting_price: 120000, sort_order: 8 },
    { category_id: bySlug['drone-photography'], name: 'Aerial Photography', description: 'Stunning drone shots for events and real estate.', features: ['Licensed pilot', '4K video option', 'Edited aerial photos', 'Weather contingency'], starting_price: 50000, sort_order: 9 },
  ];

  for (const service of services) {
    const { data: existing } = await supabase
      .from('services')
      .select('id')
      .eq('name', service.name)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from('services').insert([service]);
      if (error) console.warn(`Service "${service.name}":`, error.message);
    }
  }
}

async function seedCategoryImages(categories) {
  const images = {
    wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    graduation: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    'corporate-events': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    'birthday-parties': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    fashion: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    'studio-portraits': 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80',
    'drone-photography': 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80',
  };

  for (const cat of categories) {
    if (images[cat.slug]) {
      await supabase.from('categories').update({ image_url: images[cat.slug] }).eq('id', cat.id);
    }
  }
}

async function seedEvents({ photographerId, clientIds, categories }) {
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const [client1, client2, client3] = clientIds;

  const events = [
    {
      name: 'Sarah & James Wedding',
      client_id: client1,
      photographer_id: photographerId,
      category_id: bySlug.wedding,
      event_date: '2025-11-15',
      location: 'Speke Resort Munyonyo, Kampala',
      description: 'A beautiful beachside wedding celebration with 200 guests.',
      cover_image_url: PHOTO_URLS[0],
      gallery_url: 'sarah-james-wedding-2025',
      status: 'active',
      is_public: true,
      allow_favorites: true,
      allow_downloads: true,
      allow_comments: true,
      download_limit: 50,
    },
    {
      name: 'Ama Graduation 2025',
      client_id: client3,
      photographer_id: photographerId,
      category_id: bySlug.graduation,
      event_date: '2025-07-20',
      location: 'Makerere University, Kampala',
      description: 'Graduation ceremony and portrait session for Ama Mensah.',
      cover_image_url: PHOTO_URLS[2],
      gallery_url: 'ama-graduation-2025',
      status: 'active',
      is_public: true,
      allow_favorites: true,
      allow_downloads: true,
      allow_comments: true,
    },
    {
      name: 'Addo Family Portraits',
      client_id: client1,
      photographer_id: photographerId,
      category_id: bySlug.portrait,
      event_date: '2025-06-10',
      location: 'Entebbe Botanical Gardens',
      description: 'Annual family portrait session — password protected gallery.',
      cover_image_url: PHOTO_URLS[11],
      gallery_url: 'addo-family-portraits',
      status: 'active',
      is_public: false,
      password: 'family2025',
      allow_favorites: true,
      allow_downloads: true,
      allow_comments: true,
    },
    {
      name: 'Corporate Gala 2025',
      client_id: client2,
      photographer_id: photographerId,
      category_id: bySlug['corporate-events'],
      event_date: '2025-05-08',
      location: 'Kampala Serena Hotel',
      description: 'Annual corporate awards gala for TechUganda Ltd.',
      cover_image_url: PHOTO_URLS[10],
      gallery_url: 'corporate-gala-2025',
      status: 'completed',
      is_public: true,
      allow_favorites: false,
      allow_downloads: true,
      allow_comments: false,
    },
    {
      name: 'Michael Birthday Party',
      client_id: client2,
      photographer_id: photographerId,
      category_id: bySlug['birthday-parties'],
      event_date: '2026-02-14',
      location: 'Kololo, Kampala',
      description: '30th birthday celebration — still in planning.',
      cover_image_url: PHOTO_URLS[4],
      gallery_url: 'michael-birthday-2026',
      status: 'draft',
      is_public: false,
    },
    {
      name: 'Fashion Week Lookbook',
      client_id: client3,
      photographer_id: photographerId,
      category_id: bySlug.fashion,
      event_date: '2024-12-01',
      location: 'Kampala Fashion Week Studio',
      description: 'Archived fashion editorial shoot from last season.',
      cover_image_url: PHOTO_URLS[6],
      gallery_url: 'fashion-week-lookbook-2024',
      status: 'archived',
      is_public: false,
    },
  ];

  const eventIds = {};

  for (const event of events) {
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('gallery_url', event.gallery_url)
      .maybeSingle();

    if (existing) {
      await supabase.from('events').update(event).eq('id', existing.id);
      eventIds[event.gallery_url] = existing.id;
    } else {
      const { data, error } = await supabase.from('events').insert([event]).select('id').single();
      if (error) throw new Error(`Event "${event.name}": ${error.message}`);
      eventIds[event.gallery_url] = data.id;
    }
  }

  return eventIds;
}

async function seedAlbumsAndPhotos(eventIds) {
  const albumConfig = {
    'sarah-james-wedding-2025': ['Ceremony', 'Reception', 'Portraits'],
    'ama-graduation-2025': ['Ceremony', 'Portraits'],
    'addo-family-portraits': ['Family Shots'],
    'corporate-gala-2025': ['Event Highlights', 'Awards Night'],
    'michael-birthday-2026': ['Previews'],
    'fashion-week-lookbook-2024': ['Lookbook'],
  };

  let photoIndex = 0;
  const allPhotoIds = [];

  for (const [galleryUrl, albumNames] of Object.entries(albumConfig)) {
    const eventId = eventIds[galleryUrl];
    if (!eventId) continue;

    const { count } = await supabase.from('photos').select('*', { count: 'exact', head: true }).eq('event_id', eventId);
    if (count && count > 0) {
      const { data: existingPhotos } = await supabase.from('photos').select('id').eq('event_id', eventId);
      allPhotoIds.push(...(existingPhotos?.map((p) => p.id) ?? []));
      continue;
    }

    for (let a = 0; a < albumNames.length; a++) {
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .insert([{ event_id: eventId, name: albumNames[a], sort_order: a + 1 }])
        .select('id')
        .single();

      if (albumError) throw albumError;

      const photosPerAlbum = galleryUrl === 'sarah-james-wedding-2025' ? 4 : 3;
      const photos = Array.from({ length: photosPerAlbum }, (_, i) => {
        const url = PHOTO_URLS[photoIndex % PHOTO_URLS.length];
        photoIndex++;
        return {
          album_id: album.id,
          event_id: eventId,
          url,
          thumbnail_url: `${url}&w=400`,
          filename: `${galleryUrl}-${a + 1}-${i + 1}.jpg`,
          file_size: 2400000,
          width: 1200,
          height: 800,
          mime_type: 'image/jpeg',
          sort_order: i + 1,
        };
      });

      const { data: insertedPhotos, error: photoError } = await supabase.from('photos').insert(photos).select('id');
      if (photoError) throw photoError;
      allPhotoIds.push(...(insertedPhotos?.map((p) => p.id) ?? []));
    }
  }

  return allPhotoIds;
}

async function seedBookings() {
  const bookings = [
    { client_name: 'Grace Boateng', client_email: 'grace@example.com', client_phone: '+256 772 000 111', event_date: '2026-08-15', event_type: 'Wedding', package_name: 'Gold', message: 'Looking for full day wedding coverage at Speke Resort Munyonyo.', status: 'pending' },
    { client_name: 'David Kwarteng', client_email: 'david@example.com', client_phone: '+256 700 000 222', event_date: '2026-06-20', event_type: 'Corporate Event', package_name: 'Premium', message: 'Annual company conference with 300 attendees.', status: 'pending' },
    { client_name: 'Sarah Addo', client_email: 'client1@rubshoots.com', client_phone: '+256 700 555 123', event_date: '2025-11-15', event_type: 'Wedding', package_name: 'Gold', message: 'Lakeside wedding at Munyonyo.', status: 'confirmed' },
    { client_name: 'Michael Osei', client_email: 'client2@rubshoots.com', client_phone: '+256 778 888 456', event_date: '2025-05-08', event_type: 'Corporate Event', package_name: 'Premium', message: 'Corporate gala photography.', status: 'completed' },
    { client_name: 'Efua Ansah', client_email: 'efua@example.com', client_phone: '+256 753 000 333', event_date: '2026-03-10', event_type: 'Portrait', package_name: 'Silver', message: 'Changed plans, no longer needed.', status: 'cancelled' },
    { client_name: 'Kofi Mensah', client_email: 'kofi@example.com', client_phone: '+256 776 000 444', event_date: '2026-09-01', event_type: 'Graduation', package_name: 'Silver', message: 'Makerere University graduation photos.', status: 'pending' },
  ];

  for (const booking of bookings) {
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('client_email', booking.client_email)
      .eq('event_date', booking.event_date)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from('bookings').insert([booking]);
      if (error) console.warn(`Booking for ${booking.client_email}:`, error.message);
    }
  }
}

async function seedEngagement(eventIds, photoIds) {
  const weddingEventId = eventIds['sarah-james-wedding-2025'];
  const graduationEventId = eventIds['ama-graduation-2025'];
  if (!weddingEventId || !photoIds.length) return;

  const weddingPhotos = photoIds.slice(0, 6);
  const gradPhotos = photoIds.slice(6, 9);

  const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true });
  if (!favCount) {
    await supabase.from('favorites').insert([
      { photo_id: weddingPhotos[0], event_id: weddingEventId, client_name: 'Sarah Addo', client_email: 'client1@rubshoots.com' },
      { photo_id: weddingPhotos[1], event_id: weddingEventId, client_name: 'Sarah Addo', client_email: 'client1@rubshoots.com' },
      { photo_id: weddingPhotos[2], event_id: weddingEventId, client_name: 'James Addo', client_email: 'james@example.com' },
      ...(gradPhotos[0] ? [{ photo_id: gradPhotos[0], event_id: graduationEventId, client_name: 'Ama Mensah', client_email: 'client3@rubshoots.com' }] : []),
    ]);
  }

  const { count: commentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
  if (!commentCount && weddingPhotos[0]) {
    await supabase.from('comments').insert([
      { photo_id: weddingPhotos[0], event_id: weddingEventId, author_name: 'Guest', author_email: 'guest@example.com', content: 'What a beautiful ceremony! Congratulations to the couple.' },
      { photo_id: weddingPhotos[1], event_id: weddingEventId, author_name: 'Sarah Addo', author_email: 'client1@rubshoots.com', content: 'We absolutely love this shot! Can we get a large print?' },
      { photo_id: weddingPhotos[3], event_id: weddingEventId, author_name: 'Uncle Kofi', author_email: null, content: 'The family photos came out amazing. Thank you Rub Shoots!' },
    ]);
  }

  const { count: downloadCount } = await supabase.from('downloads').select('*', { count: 'exact', head: true });
  if (!downloadCount && weddingPhotos[0]) {
    await supabase.from('downloads').insert([
      { photo_id: weddingPhotos[0], event_id: weddingEventId, downloader_name: 'Sarah Addo', downloader_email: 'client1@rubshoots.com', download_type: 'high_res' },
      { photo_id: weddingPhotos[1], event_id: weddingEventId, downloader_name: 'Sarah Addo', downloader_email: 'client1@rubshoots.com', download_type: 'web' },
      { photo_id: weddingPhotos[2], event_id: weddingEventId, downloader_name: 'James Addo', downloader_email: 'james@example.com', download_type: 'web' },
      { photo_id: null, event_id: weddingEventId, downloader_name: 'Sarah Addo', downloader_email: 'client1@rubshoots.com', download_type: 'zip' },
      { photo_id: gradPhotos[0], event_id: graduationEventId, downloader_name: 'Ama Mensah', downloader_email: 'client3@rubshoots.com', download_type: 'high_res' },
    ]);
  }
}

async function seedWebsiteContent() {
  const { count, error } = await supabase.from('site_content').select('*', { count: 'exact', head: true });
  if (error) {
    console.log('⚠ Website content tables not found — apply supabase/migrations/20260703100000_004_create_website_content.sql');
    return;
  }
  if (count && count > 0) {
    console.log('  (site_content already populated)');
  }

  const { count: teamCount } = await supabase.from('team_members').select('*', { count: 'exact', head: true });
  if (!teamCount) {
    await supabase.from('team_members').insert([
      { name: 'Ruben Mensah', role: 'Founder & Lead Photographer', image_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400', sort_order: 1 },
      { name: 'Ama Darko', role: 'Senior Photographer', image_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400', sort_order: 2 },
      { name: 'Kofi Asante', role: 'Event Photographer', image_url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400', sort_order: 3 },
    ]);
  }

  const { count: faqCount } = await supabase.from('site_faqs').select('*', { count: 'exact', head: true });
  if (!faqCount) {
    await supabase.from('site_faqs').insert([
      { question: 'How far in advance should I book?', answer: 'We recommend booking at least 3-6 months in advance for weddings and 1-2 months for other events to ensure availability.', page: 'pricing', sort_order: 1 },
      { question: 'What is included in the edited photos?', answer: 'All edited photos include color correction, exposure adjustment, cropping, and basic retouching. Advanced retouching is available upon request.', page: 'pricing', sort_order: 2 },
      { question: 'How long until I receive my photos?', answer: 'Turnaround time is typically 2-4 weeks for standard packages and 1-2 weeks for premium packages.', page: 'pricing', sort_order: 3 },
      { question: 'Can I customize a package?', answer: 'Absolutely! Our Custom package is designed for clients who want a tailored experience. Contact us to discuss your needs.', page: 'pricing', sort_order: 4 },
    ]);
  }
}

async function seedTestimonials() {
  const { count } = await supabase.from('testimonials').select('*', { count: 'exact', head: true });
  if (count && count >= 4) return;

  await supabase.from('testimonials').insert([
    { client_name: 'The Boateng Family', client_title: 'Reunion Clients', content: 'Our family reunion photos turned out better than we imagined. Every generation was captured perfectly.', rating: 5, is_featured: false },
    { client_name: 'TechUganda Ltd', client_title: 'Corporate Partner', content: 'Rub Shoots has been our go-to for all corporate events. Reliable, professional, and consistently excellent.', rating: 5, is_featured: true },
  ]);
}

async function main() {
  console.log('🌱 Seeding Rub Shoots database...\n');

  const userIds = {};
  for (const user of USERS) {
    userIds[user.role === 'admin' ? 'admin' : user.email] = await ensureUser(user);
    console.log(`✓ User: ${user.email} (${user.role})`);
  }

  const categories = await getCategories();
  console.log(`✓ Categories: ${categories.length}`);

  await seedCategoryImages(categories);
  console.log('✓ Category images updated');

  await seedServices(categories);
  console.log('✓ Services seeded');

  const clientIds = [
    userIds['client1@rubshoots.com'],
    userIds['client2@rubshoots.com'],
    userIds['client3@rubshoots.com'],
  ];

  const eventIds = await seedEvents({
    photographerId: userIds['photographer@rubshoots.com'],
    clientIds,
    categories,
  });
  console.log(`✓ Events: ${Object.keys(eventIds).length}`);

  const photoIds = await seedAlbumsAndPhotos(eventIds);
  console.log(`✓ Photos: ${photoIds.length}`);

  await seedBookings();
  console.log('✓ Bookings seeded');

  await seedEngagement(eventIds, photoIds);
  console.log('✓ Favorites, comments & downloads seeded');

  await seedTestimonials();
  console.log('✓ Testimonials updated');

  await seedWebsiteContent();
  console.log('✓ Website content seeded');

  console.log('\n✅ Seed complete!\n');
  console.log('Test accounts (password: RubShoots2026!):');
  console.log('  Admin:        test@rubshoots.com');
  console.log('  Photographer: photographer@rubshoots.com');
  console.log('  Clients:      client1@rubshoots.com, client2@rubshoots.com, client3@rubshoots.com');
  console.log('\nPublic galleries:');
  console.log('  /gallery/sarah-james-wedding-2025');
  console.log('  /gallery/ama-graduation-2025');
  console.log('  /gallery/corporate-gala-2025');
  console.log('\nPassword-protected gallery:');
  console.log('  /gallery/addo-family-portraits  (password: family2025)');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
