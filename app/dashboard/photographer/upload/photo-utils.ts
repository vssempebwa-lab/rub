import type { Photo, QueuedUpload, RejectedUpload } from './types';

export const PHOTO_BUCKET = 'photos';
export const MAX_UPLOAD_SIZE_MB = 25;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
export const PHOTO_PAGE_SIZE = 50;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
] as const;

const acceptedExtensions = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp'];

export function formatFileSize(bytes: number | null) {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatUploadDate(value: string) {
  return new Intl.DateTimeFormat('en-UG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function validateUploadFiles(files: File[]) {
  const accepted: QueuedUpload[] = [];
  const rejected: RejectedUpload[] = [];

  files.forEach((file) => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const typeAllowed =
      ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]) ||
      acceptedExtensions.includes(extension);

    if (!typeAllowed) {
      rejected.push({
        id: crypto.randomUUID(),
        filename: file.name,
        reason: 'Use JPEG, PNG, HEIC, or WebP images.',
      });
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      rejected.push({
        id: crypto.randomUUID(),
        filename: file.name,
        reason: `File is larger than ${MAX_UPLOAD_SIZE_MB}MB.`,
      });
      return;
    }

    accepted.push({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: 'queued',
    });
  });

  return { accepted, rejected };
}

export function buildStoragePath(eventId: string, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  return `${eventId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

export function getPhotoStoragePath(photo: Photo) {
  const url = photo.url || photo.thumbnail_url || '';
  const marker = `/${PHOTO_BUCKET}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex >= 0) {
    return decodeURIComponent(url.slice(markerIndex + marker.length).split('?')[0]);
  }

  try {
    const parsed = new URL(url);
    const objectIndex = parsed.pathname.indexOf(`/object/public/${PHOTO_BUCKET}/`);
    if (objectIndex >= 0) {
      return decodeURIComponent(
        parsed.pathname.slice(objectIndex + `/object/public/${PHOTO_BUCKET}/`.length)
      );
    }
  } catch {
    // Fall through to the legacy filename fallback.
  }

  return photo.filename ? `${photo.event_id}/${photo.filename}` : '';
}
