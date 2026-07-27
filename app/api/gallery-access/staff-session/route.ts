import { NextResponse } from 'next/server';
import {
  findPublicGalleryEvent,
  GALLERY_ACCESS_COOKIE,
  GALLERY_SESSION_HOURS,
  generateAccessToken,
  getCookieOptions,
  getServerSupabase,
  hashSecret,
} from '@/lib/gallery-access';

const allowedRoles = new Set(['admin', 'photographer']);

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!accessToken) return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });

  const userClient = getServerSupabase(false, accessToken);
  const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  const { data: profile } = await userClient
    .from('profiles')
    .select('role,full_name')
    .eq('id', userData.user.id)
    .single();

  if (!allowedRoles.has(profile?.role ?? '')) {
    return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  }

  const { shareToken } = await request.json();
  const event = await findPublicGalleryEvent(String(shareToken || ''));
  if (!event) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });

  const service = getServerSupabase(true);
  const token = generateAccessToken();
  const expiresAt = new Date(Date.now() + GALLERY_SESSION_HOURS * 60 * 60 * 1000).toISOString();

  const { error: sessionError } = await service.from('gallery_access_sessions').insert({
    event_id: event.id,
    otp_id: null,
    access_token_hash: hashSecret(token),
    full_name: profile?.full_name || 'Staff',
    phone_number: 'staff',
    expires_at: expiresAt,
  });

  if (sessionError) throw sessionError;

  const response = NextResponse.json({ ok: true, event });
  response.cookies.set(
    GALLERY_ACCESS_COOKIE,
    token,
    getCookieOptions(GALLERY_SESSION_HOURS * 60 * 60),
  );

  return response;
}
