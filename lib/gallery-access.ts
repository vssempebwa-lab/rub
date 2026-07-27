import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const GALLERY_ACCESS_COOKIE = 'rub_gallery_access';
export const GALLERY_SESSION_HOURS = Number(process.env.GALLERY_ACCESS_SESSION_HOURS || 24);

export type GalleryAccessEvent = {
  id: string;
  name: string;
  share_token: string | null;
  gallery_url: string | null;
  event_date: string | null;
  location: string | null;
  description: string | null;
  cover_image_url: string | null;
  mobile_cover_image_url: string | null;
  allow_favorites: boolean;
  allow_downloads: boolean;
  allow_comments: boolean;
  is_public: boolean;
};

export function getServerSupabase(useServiceRole = true, accessToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase server environment variables.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function normalizePhone(countryCode: string, phoneNumber: string) {
  const code = countryCode.trim().replace(/[^\d+]/g, '');
  const number = phoneNumber.trim().replace(/[^\d]/g, '').replace(/^0+/, '');
  const normalizedCode = code.startsWith('+') ? code : `+${code}`;

  if (!/^\+\d{1,4}$/.test(normalizedCode) || number.length < 7 || number.length > 14) {
    return null;
  }

  return `${normalizedCode}${number}`;
}

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function generateAccessToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashSecret(value: string) {
  const secret =
    process.env.GALLERY_ACCESS_OTP_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'rub-gallery-dev-secret';

  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function getCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

export function makeShareToken() {
  return crypto.randomBytes(18).toString('base64url');
}

export function getPhotoPath(url: string | null | undefined) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const markers = [
      '/storage/v1/object/public/photos/',
      '/storage/v1/object/sign/photos/',
      '/object/public/photos/',
      '/object/sign/photos/',
    ];

    for (const marker of markers) {
      const index = parsed.pathname.indexOf(marker);
      if (index >= 0) return decodeURIComponent(parsed.pathname.slice(index + marker.length));
    }
  } catch {
    const marker = '/photos/';
    const index = url.indexOf(marker);
    if (index >= 0) return decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
  }

  return '';
}

export async function findPublicGalleryEvent(shareToken: string) {
  const supabase = getServerSupabase(true);
  const { data, error } = await supabase
    .from('events')
    .select(
      'id,name,share_token,gallery_url,event_date,location,description,cover_image_url,mobile_cover_image_url,allow_favorites,allow_downloads,allow_comments,is_public',
    )
    .or(`share_token.eq.${shareToken},gallery_url.eq.${shareToken}`)
    .eq('is_public', true)
    .maybeSingle();

  if (error) throw error;
  return data as GalleryAccessEvent | null;
}

export async function verifyGallerySession(shareToken: string, token: string | undefined) {
  if (!token) return null;

  const event = await findPublicGalleryEvent(shareToken);
  if (!event) return null;

  const supabase = getServerSupabase(true);
  const { data, error } = await supabase
    .from('gallery_access_sessions')
    .select('id,event_id,expires_at,revoked_at')
    .eq('event_id', event.id)
    .eq('access_token_hash', hashSecret(token))
    .maybeSingle();

  if (error || !data || data.revoked_at || new Date(data.expires_at).getTime() <= Date.now()) {
    return null;
  }

  return event;
}
