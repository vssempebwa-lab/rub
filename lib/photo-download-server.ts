import { getPhotoPath, getServerSupabase } from '@/lib/gallery-access';

export async function fetchPhotoBytes(url: string) {
  const path = getPhotoPath(url);

  if (path) {
    const supabase = getServerSupabase(true);
    const { data, error } = await supabase.storage.from('photos').download(path);
    if (!error && data) {
      return {
        buffer: Buffer.from(await data.arrayBuffer()),
        contentType: data.type || 'application/octet-stream',
      };
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'RubShootsGallery/1.0',
      },
    });
    if (!response.ok) return null;

    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get('content-type') || 'application/octet-stream',
    };
  } catch {
    return null;
  }
}
