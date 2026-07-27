import { supabase } from '@/lib/supabase';

const PHOTO_BUCKET = 'photos';
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type DisplayablePhoto = {
  url: string;
  thumbnail_url: string | null;
  watermarked_url?: string | null;
};

export type PhotoWithDisplayUrls<T extends DisplayablePhoto> = T & {
  display_url?: string;
  thumbnail_display_url?: string | null;
  watermarked_display_url?: string | null;
};

export function getPhotoStoragePathFromUrl(url: string | null | undefined) {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    const markers = [
      `/storage/v1/object/public/${PHOTO_BUCKET}/`,
      `/storage/v1/object/sign/${PHOTO_BUCKET}/`,
      `/object/public/${PHOTO_BUCKET}/`,
      `/object/sign/${PHOTO_BUCKET}/`,
    ];

    for (const marker of markers) {
      const markerIndex = parsed.pathname.indexOf(marker);
      if (markerIndex >= 0) {
        return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
      }
    }
  } catch {
    const marker = `/${PHOTO_BUCKET}/`;
    const markerIndex = url.indexOf(marker);
    if (markerIndex >= 0) {
      return decodeURIComponent(url.slice(markerIndex + marker.length).split('?')[0]);
    }
  }

  return '';
}

async function createSignedPhotoUrl(url: string | null | undefined) {
  const path = getPhotoStoragePathFromUrl(url);
  if (!path) return url ?? '';

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  return error ? url ?? '' : data?.signedUrl ?? url ?? '';
}

export async function resolvePhotoDisplayUrls<T extends DisplayablePhoto>(
  photos: T[],
): Promise<PhotoWithDisplayUrls<T>[]> {
  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      display_url: await createSignedPhotoUrl(photo.url),
      thumbnail_display_url: await createSignedPhotoUrl(photo.thumbnail_url || photo.url),
      watermarked_display_url: await createSignedPhotoUrl(photo.watermarked_url),
    })),
  );
}
