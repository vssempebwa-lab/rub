import { NextResponse } from 'next/server';
import { createStoredZip } from '@/lib/gallery-zip';
import { GALLERY_ACCESS_COOKIE, getPhotoPath, getServerSupabase, verifyGallerySession } from '@/lib/gallery-access';

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
  const { shareToken, photoIds } = await request.json();
  const event = await verifyGallerySession(String(shareToken || ''), getAccessCookie(request));

  if (!event) return NextResponse.json({ error: 'Gallery access required.' }, { status: 401 });
  if (!event.allow_downloads) {
    return NextResponse.json({ error: 'Downloads are disabled for this event.' }, { status: 403 });
  }

  const ids = Array.isArray(photoIds) ? photoIds.slice(0, 200).map(String) : [];
  if (ids.length === 0) return NextResponse.json({ error: 'Select at least one photo.' }, { status: 400 });

  const supabase = getServerSupabase(true);
  const { data: photos, error } = await supabase
    .from('photos')
    .select('id,url,filename')
    .eq('event_id', event.id)
    .in('id', ids);

  if (error) throw error;

  const files = [];
  for (let index = 0; index < (photos || []).length; index++) {
    const photo = photos![index];
    const path = getPhotoPath(photo.url);
    const { data, error: downloadError } = await supabase.storage.from('photos').download(path);
    if (downloadError || !data) continue;
    files.push({
      filename: safeFilename(photo.filename, `photo-${index + 1}.jpg`),
      data: Buffer.from(await data.arrayBuffer()),
    });
  }

  if (files.length === 0) {
    return NextResponse.json({ error: 'No downloadable photos found.' }, { status: 404 });
  }

  await supabase.from('downloads').insert({
    event_id: event.id,
    photo_id: null,
    download_type: 'zip',
  });

  const zip = createStoredZip(files);
  return new NextResponse(zip, {
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="${safeFilename(event.name, 'rub-gallery')}.zip"`,
    },
  });
}
