'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FolderOpen, Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import type { EventCardData } from './EventCard';

type EventPreviewModalProps = {
  event: EventCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PreviewPhoto = {
  id: string;
  url: string;
  thumbnail_url: string | null;
  filename: string | null;
};

export function EventPreviewModal({ event, open, onOpenChange }: EventPreviewModalProps) {
  const [desktopCoverFailed, setDesktopCoverFailed] = useState(false);
  const [mobileCoverFailed, setMobileCoverFailed] = useState(false);
  const [photos, setPhotos] = useState<PreviewPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setDesktopCoverFailed(false);
    setMobileCoverFailed(false);
  }, [event?.cover_image_url, event?.mobile_cover_image_url, event?.id]);

  useEffect(() => {
    if (!open || !event) return;
    const eventId = event.id;

    async function loadPhotos() {
      setLoadingPhotos(true);
      setPhotoError('');
      const { data, error } = await supabase
        .from('photos')
        .select('id,url,thumbnail_url,filename')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) {
        setPhotoError(error.message);
        setPhotos([]);
      } else {
        setPhotos(data || []);
      }
      setLoadingPhotos(false);
    }

    loadPhotos();
  }, [event, open]);

  if (!event) return null;

  const desktopCoverUrl = desktopCoverFailed
    ? null
    : event.cover_image_url || event.mobile_cover_image_url;
  const mobileCoverUrl = mobileCoverFailed
    ? null
    : event.mobile_cover_image_url || event.cover_image_url;
  const hasCover = Boolean(desktopCoverUrl || mobileCoverUrl);
  const visiblePhotos = photos.filter((photo) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (photo.filename || '').toLowerCase().includes(query);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-6xl flex-col p-0">
        <DialogHeader className="border-b px-5 py-4">
          <div>
            <div>
              <DialogTitle>{event.name}</DialogTitle>
              {!event.is_public && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Client delivery not yet activated - this is a photographer-only preview.
                </p>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="relative mx-5 mt-4 aspect-[16/6] overflow-hidden rounded-lg bg-orange-50">
            {hasCover ? (
              <>
                {mobileCoverUrl && (
                  <Image
                    src={mobileCoverUrl}
                    alt={`${event.name} mobile banner`}
                    fill
                    sizes="100vw"
                    className="object-cover sm:hidden"
                    onError={() => setMobileCoverFailed(true)}
                  />
                )}
                {desktopCoverUrl && (
                  <Image
                    src={desktopCoverUrl}
                    alt={`${event.name} banner`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="hidden object-cover sm:block"
                    onError={() => setDesktopCoverFailed(true)}
                  />
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <FolderOpen className="h-12 w-12 text-orange-700/70" />
              </div>
            )}
          </div>

          <div className="space-y-5 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">Client Gallery Preview</h3>
                <p className="text-sm text-muted-foreground">
                  {photos.length} photo{photos.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="relative sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search photos..."
                  className="pl-10"
                />
              </div>
            </div>

            {loadingPhotos ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading photos...
              </div>
            ) : photoError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
                {photoError}
              </div>
            ) : photos.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No photos uploaded yet.</p>
              </div>
            ) : visiblePhotos.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No photos match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {visiblePhotos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <img
                      src={photo.thumbnail_url || photo.url}
                      alt={photo.filename || event.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
