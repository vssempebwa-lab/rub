import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/gallery-access';
import { fetchPhotoBytes } from '@/lib/photo-download-server';

function safeFilename(value: string | null, fallback: string) {
  return (value || fallback).replace(/[\\/:*?"<>|]+/g, '-');
}

export async function GET(request: Request) {
  const photoId = new URL(request.url).searchParams.get('photoId');
  if (!photoId) return NextResponse.json({ error: 'Missing photo id.' }, { status: 400 });

  const supabase = getServerSupabase(true);
  const { data: photo, error } = await supabase
    .from('photos')
    .select('id,url,filename,mime_type,event_id,events(allow_downloads,is_public,status)')
    .eq('id', photoId)
    .single();

  if (error || !photo) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });

  const event = Array.isArray(photo.events) ? photo.events[0] : photo.events;
  if (!event?.allow_downloads) {
    return NextResponse.json({ error: 'Downloads are disabled for this event.' }, { status: 403 });
  }
  if (!event.is_public && event.status !== 'active') {
    return NextResponse.json({ error: 'Gallery not available.' }, { status: 403 });
  }

  const file = await fetchPhotoBytes(photo.url);
  if (!file) return NextResponse.json({ error: 'Unable to download photo.' }, { status: 404 });

  await supabase.from('downloads').insert({
    event_id: photo.event_id,
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
