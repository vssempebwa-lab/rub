'use client';

import { Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { formatFileSize, formatUploadDate } from './photo-utils';
import type { Photo } from './types';

type PhotoThumbnailProps = {
  photo: Photo;
  selected: boolean;
  onToggleSelected: (photoId: string) => void;
  onPreview: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
};

export function PhotoThumbnail({
  photo,
  selected,
  onToggleSelected,
  onPreview,
  onDelete,
}: PhotoThumbnailProps) {
  const imageUrl = photo.thumbnail_display_url || photo.display_url || photo.thumbnail_url || photo.url;
  const filename = photo.filename || 'Uploaded photo';

  return (
    <article
      className={`group overflow-hidden rounded-lg border bg-card transition hover:-translate-y-0.5 hover:shadow-md ${
        selected ? 'border-orange-600 ring-2 ring-orange-600/30' : 'border-border'
      }`}
    >
      <div className="relative aspect-square bg-muted">
        <button
          type="button"
          onClick={() => onPreview(photo)}
          className="block h-full w-full focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
        >
          <img src={imageUrl} alt={filename} loading="lazy" className="h-full w-full object-cover" />
        </button>

        <div className="absolute left-2 top-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelected(photo.id)}
            className="h-5 w-5 border-white bg-black/45 text-white data-[state=checked]:bg-orange-600"
            aria-label={`Select ${filename}`}
          />
        </div>

        <button
          type="button"
          onClick={() => onDelete(photo)}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-100 transition hover:bg-destructive sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={`Delete ${filename}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-1 p-3">
        <p className="truncate text-sm font-medium">{filename}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(photo.file_size)}</p>
        <p className="text-xs text-muted-foreground">{formatUploadDate(photo.created_at)}</p>
      </div>
    </article>
  );
}
