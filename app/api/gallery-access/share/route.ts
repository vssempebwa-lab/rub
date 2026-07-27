import { NextResponse } from 'next/server';
import {
  getServerSupabase,
  makeShareToken,
} from '@/lib/gallery-access';
import {
  computeGalleryLinkExpiryDate,
  getDefaultGalleryLinkExpiryDays,
} from '@/lib/gallery-link-settings';

const allowedRoles = new Set(['admin', 'photographer']);

function normalizeExpirationDate(value: unknown) {
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    parsed.setUTCHours(23, 59, 59, 999);
  }

  return parsed.toISOString();
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!accessToken) return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });

  const supabase = getServerSupabase(false, accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  const role = profile?.role ?? '';
  if (!allowedRoles.has(role)) {
    return NextResponse.json({ error: 'Workspace access required.' }, { status: 403 });
  }

  const { eventId, expirationDate } = await request.json();
  if (!eventId) return NextResponse.json({ error: 'Missing event id.' }, { status: 400 });

  const service = getServerSupabase(true);
  const { data: event, error } = await service
    .from('events')
    .select('id,name,is_public,share_token,gallery_url,expiration_date')
    .eq('id', eventId)
    .single();

  if (error || !event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  if (!event.is_public) {
    return NextResponse.json(
      { error: 'Activate Client Delivery before sharing this event.' },
      { status: 409 },
    );
  }

  const updates: { share_token?: string; expiration_date?: string | null } = {};
  let shareToken = event.share_token;

  if (!shareToken) {
    shareToken = makeShareToken();
    updates.share_token = shareToken;
  }

  if (expirationDate !== undefined) {
    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can change gallery link expiry.' },
        { status: 403 },
      );
    }

    const normalized = normalizeExpirationDate(expirationDate);
    if (normalized === undefined) {
      return NextResponse.json({ error: 'Invalid expiration date.' }, { status: 400 });
    }

    updates.expiration_date = normalized;
  } else if (!event.expiration_date) {
    const defaultDays = await getDefaultGalleryLinkExpiryDays();
    if (defaultDays > 0) {
      updates.expiration_date = computeGalleryLinkExpiryDate(defaultDays);
    }
  }

  if (Object.keys(updates).length > 0) {
    const { data: updated, error: updateError } = await service
      .from('events')
      .update(updates)
      .eq('id', event.id)
      .select('expiration_date')
      .single();

    if (updateError) throw updateError;
    event.expiration_date = updated?.expiration_date ?? event.expiration_date;
    if (updates.share_token) event.share_token = updates.share_token;
  }

  return NextResponse.json({
    shareToken,
    sharePath: `/e/${shareToken}`,
    legacyGalleryPath: `/gallery/${event.gallery_url || event.id}`,
    expirationDate: event.expiration_date,
  });
}
