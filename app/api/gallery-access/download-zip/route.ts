import { NextResponse } from 'next/server';
import { createStoredZip } from '@/lib/gallery-zip';
import { getServerSupabase, resolveGalleryAccess } from '@/lib/gallery-access';
import { fetchPhotoBytes } from '@/lib/photo-download-server';

function safeFilename(value: string | null, fallback: string) {
  return (value || fallback).replace(/[\\/:*?"<>|]+/g, '-');
}

function uniqueZipFilename(baseName: string, usedNames: Set<string>) {
  let candidate = baseName;
  let counter = 2;
  while (usedNames.has(candidate)) {
    const extensionMatch = baseName.match(/(\.[^.]+)$/);
    const extension = extensionMatch?.[1] ?? '';
    const stem = extension ? baseName.slice(0, -extension.length) : baseName;
    candidate = `${stem}-${counter}${extension}`;
    counter += 1;
  }
  usedNames.add(candidate);
  return candidate;
}

export async function POST(request: Request) {
  try {
    const { shareToken, photoIds } = await request.json();
    const event = await resolveGalleryAccess(request, String(shareToken || ''));

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

    const usedNames = new Set<string>();
    const files = [];
    for (let index = 0; index < (photos || []).length; index++) {
      const photo = photos![index];
      const file = await fetchPhotoBytes(photo.url);
      if (!file) continue;

      const baseName = safeFilename(photo.filename, `photo-${index + 1}.jpg`);
      files.push({
        filename: uniqueZipFilename(baseName, usedNames),
        data: file.buffer,
      });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No downloadable photos found.' }, { status: 404 });
    }

    await supabase.from('downloads').insert({
      event_id: event.id,
      photo_id: null,
      download_type: 'zip',
    }).then(({ error: downloadError }) => {
      if (downloadError) console.warn('ZIP download tracking failed:', downloadError.message);
    });

    const zip = createStoredZip(files);
    return new NextResponse(new Uint8Array(zip), {
      headers: {
        'content-type': 'application/zip',
        'content-disposition': `attachment; filename="${safeFilename(event.name, 'rub-gallery')}.zip"`,
        'content-length': String(zip.length),
      },
    });
  } catch (error) {
    console.error('ZIP download failed:', error);
    return NextResponse.json({ error: 'Unable to create ZIP download.' }, { status: 500 });
  }
}
