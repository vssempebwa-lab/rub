'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CalendarDays, Copy, Eye, FolderOpen, MapPin, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import type { EventCardData } from './EventCard';

type EventShareDialogProps = {
  event: EventCardData | null;
  shareUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenGallery?: (event: EventCardData) => void;
};

function formatDate(value: string | null) {
  if (!value) return 'Date not set';
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function EventShareDialog({
  event,
  shareUrl,
  open,
  onOpenChange,
  onOpenGallery,
}: EventShareDialogProps) {
  const [desktopCoverFailed, setDesktopCoverFailed] = useState(false);
  const [mobileCoverFailed, setMobileCoverFailed] = useState(false);

  useEffect(() => {
    setDesktopCoverFailed(false);
    setMobileCoverFailed(false);
  }, [event?.cover_image_url, event?.mobile_cover_image_url, event?.id]);

  if (!event) return null;

  const desktopCoverUrl = desktopCoverFailed
    ? null
    : event.cover_image_url || event.mobile_cover_image_url;
  const mobileCoverUrl = mobileCoverFailed
    ? null
    : event.mobile_cover_image_url || event.cover_image_url;
  const hasCover = Boolean(desktopCoverUrl || mobileCoverUrl);

  async function copyShareText(label: string) {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: 'Copied', description: `${label} copied to clipboard.` });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Your browser blocked clipboard access. Copy the link manually from the box below.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <div className="relative aspect-[16/7] w-full bg-orange-50 sm:aspect-[16/6]">
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
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="hidden object-cover sm:block"
                  onError={() => setDesktopCoverFailed(true)}
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FolderOpen className="h-14 w-14 text-orange-700/70" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <Share2 className="h-3.5 w-3.5" />
                Share gallery
              </span>
              <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white">
                Client delivery active
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold leading-tight sm:text-3xl">
              {event.name}
            </h2>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-orange-700" />
              {formatDate(event.event_date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-700" />
              {event.location || 'No location set'}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
              {event.photo_count} photo{event.photo_count === 1 ? '' : 's'}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            Send this branded gallery access link to your client. They will verify with WhatsApp OTP before viewing photos.
          </p>

          <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
            <div className="mx-auto w-full max-w-[220px] rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Scan to open
              </div>
              <div className="flex justify-center">
                {shareUrl ? (
                  <QRCodeSVG value={shareUrl} size={168} level="M" includeMargin />
                ) : (
                  <div className="flex h-[168px] w-[168px] items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                    Preparing QR...
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Gallery link
                </p>
                <div className="rounded-xl border bg-muted/30 p-3 text-sm break-all">
                  {shareUrl || 'No link available yet.'}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button onClick={() => copyShareText('Gallery link')} disabled={!shareUrl}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenGallery?.(event);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Open gallery
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
