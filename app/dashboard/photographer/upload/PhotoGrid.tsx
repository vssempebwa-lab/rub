'use client';

import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Photo } from './types';
import { PhotoThumbnail } from './PhotoThumbnail';

type PhotoGridProps = {
  selectedEventId: string;
  photos: Photo[];
  selectedPhotoIds: Set<string>;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onToggleSelected: (photoId: string) => void;
  onPreview: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
};

export function PhotoGrid({
  selectedEventId,
  photos,
  selectedPhotoIds,
  loading,
  error,
  hasMore,
  loadingMore,
  onLoadMore,
  onToggleSelected,
  onPreview,
  onDelete,
}: PhotoGridProps) {
  if (!selectedEventId) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="font-semibold">Select an event to view and manage its photos</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Uploaded photos, selections, previews, and delete tools will appear here.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <h3 className="font-semibold text-destructive">Unable to load photos</h3>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="font-semibold">No photos uploaded yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add images with the uploader above, then manage them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {photos.map((photo) => (
          <PhotoThumbnail
            key={photo.id}
            photo={photo}
            selected={selectedPhotoIds.has(photo.id)}
            onToggleSelected={onToggleSelected}
            onPreview={onPreview}
            onDelete={onDelete}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
