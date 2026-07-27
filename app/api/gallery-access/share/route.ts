import { NextResponse } from 'next/server';
import { getServerSupabase, makeShareToken } from '@/lib/gallery-access';

const allowedRoles = new Set(['admin', 'photographer']);

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

  if (!allowedRoles.has(profile?.role ?? '')) {
    return NextResponse.json({ error: 'Workspace access required.' }, { status: 403 });
  }

  const { eventId } = await request.json();
  if (!eventId) return NextResponse.json({ error: 'Missing event id.' }, { status: 400 });

  const service = getServerSupabase(true);
  const { data: event, error } = await service
    .from('events')
    .select('id,name,is_public,share_token,gallery_url')
    .eq('id', eventId)
    .single();

  if (error || !event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  if (!event.is_public) {
    return NextResponse.json(
      { error: 'Activate Client Delivery before sharing this event.' },
      { status: 409 },
    );
  }

  let shareToken = event.share_token;
  if (!shareToken) {
    shareToken = makeShareToken();
    const { error: updateError } = await service
      .from('events')
      .update({ share_token: shareToken })
      .eq('id', event.id);
    if (updateError) throw updateError;
  }

  return NextResponse.json({
    shareToken,
    sharePath: `/e/${shareToken}`,
    legacyGalleryPath: `/gallery/${event.gallery_url || event.id}`,
  });
}
