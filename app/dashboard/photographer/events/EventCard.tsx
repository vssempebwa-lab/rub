'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CalendarDays, Edit, Eye, FolderOpen, ImagePlus, MapPin, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type EventCardData = {
  id: string;
  name: string;
  event_date: string | null;
  location: string | null;
  gallery_url: string | null;
  status: string;
  password: string | null;
  is_public: boolean;
  event_type: 'coverage' | 'photoshoot' | null;
  photoshoot_category: string | null;
  cover_image_url: string | null;
  mobile_cover_image_url: string | null;
  photo_count: number;
};

type EventCardProps = {
  event: EventCardData;
  onEdit: (event: EventCardData) => void;
  onPreview: (event: EventCardData) => void;
  onShare: (event: EventCardData) => void;
  onAddPhotos: (eventId: string) => void;
  onDelete: (eventId: string) => void;
};

function formatDate(value: string | null) {
  if (!value) return 'No date';
  return new Date(value).toLocaleDateString();
}

function eventTypeLabel(event: EventCardData) {
  if (event.event_type === 'coverage') return 'Coverage';
  if (event.event_type === 'photoshoot') {
    return event.photoshoot_category ? `Photoshoot - ${event.photoshoot_category}` : 'Photoshoot';
  }
  return null;
}

export function EventCard({
  event,
  onEdit,
  onPreview,
  onShare,
  onAddPhotos,
  onDelete,
}: EventCardProps) {
  const typeLabel = eventTypeLabel(event);
  const [desktopCoverFailed, setDesktopCoverFailed] = useState(false);
  const [mobileCoverFailed, setMobileCoverFailed] = useState(false);
  const desktopCoverUrl = desktopCoverFailed
    ? null
    : event.cover_image_url || event.mobile_cover_image_url;
  const mobileCoverUrl = mobileCoverFailed
    ? null
    : event.mobile_cover_image_url || event.cover_image_url;
  const hasCover = Boolean(desktopCoverUrl || mobileCoverUrl);

  useEffect(() => {
    setDesktopCoverFailed(false);
    setMobileCoverFailed(false);
  }, [event.cover_image_url, event.mobile_cover_image_url, event.id]);

  return (
    <Card className="overflow-hidden border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/10] bg-muted">
        {hasCover ? (
          <>
            {mobileCoverUrl && (
              <Image
                src={mobileCoverUrl}
                alt={event.name}
                fill
                sizes="100vw"
                className="object-cover sm:hidden"
                onError={() => setMobileCoverFailed(true)}
              />
            )}
            {desktopCoverUrl && (
              <Image
                src={desktopCoverUrl}
                alt={event.name}
                fill
                sizes="(max-width: 1280px) 50vw, 33vw"
                className="hidden object-cover sm:block"
                onError={() => setDesktopCoverFailed(true)}
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-orange-50">
            <FolderOpen className="h-12 w-12 text-orange-700/70" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${event.is_public ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-700'}`}>
            {event.is_public ? 'Public' : 'Private'}
          </span>
          <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-stone-700">
            {event.status}
          </span>
        </div>
      </div>

      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {typeLabel && (
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
                {typeLabel}
              </span>
            )}
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
              {event.photo_count} photo{event.photo_count === 1 ? '' : 's'}
            </span>
          </div>
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{event.name}</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-orange-700" />
              {formatDate(event.event_date)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-700" />
              {event.location || 'No location set'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onPreview(event)}>
            <Eye className="mr-2 h-4 w-4" />Preview
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
            <Edit className="mr-2 h-4 w-4" />Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onShare(event)}>
            <Share2 className="mr-2 h-4 w-4" />Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddPhotos(event.id)}>
            <ImagePlus className="mr-2 h-4 w-4" />Photos
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="col-span-2"
            onClick={() => onDelete(event.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
