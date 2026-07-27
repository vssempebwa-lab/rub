'use client';

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatFileSize, formatUploadDate } from './photo-utils';
import type { Photo } from './types';

type PhotoLightboxProps = {
  photos: Photo[];
  photo: Photo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangePhoto: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
};

export function PhotoLightbox({
  photos,
  photo,
  open,
  onOpenChange,
  onChangePhoto,
  onDelete,
}: PhotoLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const currentIndex = photo ? photos.findIndex((item) => item.id === photo.id) : -1;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < photos.length - 1;

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open, photo?.id]);

  useEffect(() => {
    if (!open || !photo) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange(false);
      if (event.key === 'ArrowLeft' && canGoPrevious) onChangePhoto(photos[currentIndex - 1]);
      if (event.key === 'ArrowRight' && canGoNext) onChangePhoto(photos[currentIndex + 1]);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoNext, canGoPrevious, currentIndex, onChangePhoto, onOpenChange, open, photo, photos]);

  if (!photo) return null;

  const filename = photo.filename || 'Uploaded photo';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-w-6xl grid-rows-[auto_1fr_auto] flex-col border-0 bg-black p-0 text-white sm:rounded-lg">
        <DialogTitle className="sr-only">{filename}</DialogTitle>
        <div className="flex items-center justify-between border-b border-white/10 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{filename}</p>
            <p className="text-xs text-white/60">
              {currentIndex + 1} / {photos.length} - {formatFileSize(photo.file_size)} -{' '}
              {formatUploadDate(photo.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={() => onDelete(photo)}
              aria-label={`Delete ${filename}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center p-4">
          <img src={photo.display_url || photo.url} alt={filename} className="max-h-full max-w-full object-contain" />

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-white/15 hover:text-white disabled:opacity-30"
            disabled={!canGoPrevious}
            onClick={() => onChangePhoto(photos[currentIndex - 1])}
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-white/15 hover:text-white disabled:opacity-30"
            disabled={!canGoNext}
            onClick={() => onChangePhoto(photos[currentIndex + 1])}
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
