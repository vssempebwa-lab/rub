import { NextResponse } from 'next/server';
import { getPhotoPath, getServerSupabase, resolveGalleryAccess } from '@/lib/gallery-access';

export async function GET(request: Request) {
  const shareToken = new URL(request.url).searchParams.get('shareToken') || '';
  const event = await resolveGalleryAccess(request, shareToken);

  if (!event) return NextResponse.json({ error: 'Gallery access required.' }, { status: 401 });

  const supabase = getServerSupabase(true);
  const { data, error } = await supabase
    .from('photos')
    .select('id,event_id,url,thumbnail_url,watermarked_url,filename,file_size,mime_type,created_at,sort_order')
    .eq('event_id', event.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;

  const photos = await Promise.all(
    (data || []).map(async (photo) => {
      const displayPath = getPhotoPath(photo.url);
      const thumbPath = getPhotoPath(photo.thumbnail_url || photo.url);
      const [{ data: display }, { data: thumb }] = await Promise.all([
        displayPath
          ? supabase.storage.from('photos').createSignedUrl(displayPath, 60 * 60)
          : Promise.resolve({ data: null }),
        thumbPath
          ? supabase.storage.from('photos').createSignedUrl(thumbPath, 60 * 60)
          : Promise.resolve({ data: null }),
      ]);

      return {
        ...photo,
        display_url: display?.signedUrl || photo.url,
        thumbnail_display_url: thumb?.signedUrl || photo.thumbnail_url || photo.url,
      };
    }),
  );

  return NextResponse.json({ event, photos });
}
