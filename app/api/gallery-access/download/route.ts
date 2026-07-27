import { NextResponse } from 'next/server';
import { GALLERY_ACCESS_COOKIE, getServerSupabase, verifyGallerySession } from '@/lib/gallery-access';
import { fetchPhotoBytes } from '@/lib/photo-download-server';

function getAccessCookie(request: Request) {
  return request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${GALLERY_ACCESS_COOKIE}=`))
    ?.split('=')[1];
}

function safeFilename(value: string | null, fallback: string) {
  return (value || fallback).replace(/[\\/:*?"<>|]+/g, '-');
}

export async function POST(request: Request) {
  const { shareToken, photoId } = await request.json();
  const event = await verifyGallerySession(String(shareToken || ''), getAccessCookie(request));

  if (!event) return NextResponse.json({ error: 'Gallery access required.' }, { status: 401 });
  if (!event.allow_downloads) {
    return NextResponse.json({ error: 'Downloads are disabled for this event.' }, { status: 403 });
  }
  if (!photoId) return NextResponse.json({ error: 'Missing photo id.' }, { status: 400 });

  const supabase = getServerSupabase(true);
  const { data: photo, error } = await supabase
    .from('photos')
    .select('id,url,filename,mime_type')
    .eq('id', photoId)
    .eq('event_id', event.id)
    .single();

  if (error || !photo) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });

  const file = await fetchPhotoBytes(photo.url);
  if (!file) return NextResponse.json({ error: 'Unable to download photo.' }, { status: 404 });

  await supabase.from('downloads').insert({
    event_id: event.id,
    photo_id: photo.id,
    download_type: 'high_res',
  });

  const filename = safeFilename(photo.filename, `photo-${photo.id}.jpg`);

  return new NextResponse(file.buffer, {
    headers: {
      'content-type': photo.mime_type || file.contentType,
      'content-disposition': `attachment; filename="${filename}"`,
    },
  });
}
