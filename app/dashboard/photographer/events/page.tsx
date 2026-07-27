'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Loader2, Plus, Eye, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { EventCard, type EventCardData } from './EventCard';
import { EventPreviewModal } from './EventPreviewModal';

interface EventRecord extends EventCardData {
  id: string;
  name: string;
  event_date: string | null;
  location: string | null;
  gallery_url: string | null;
  share_token: string | null;
  qr_code_url: string | null;
  status: string;
  password: string | null;
  expiration_date: string | null;
  is_public: boolean;
  description: string | null;
  event_type: 'coverage' | 'photoshoot' | null;
  photoshoot_category: string | null;
  cover_image_url: string | null;
  mobile_cover_image_url: string | null;
  photo_count: number;
}

interface EventForm {
  name: string;
  event_date: string;
  location: string;
  expiration_date: string;
  password: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  description: string;
  cover_image_url: string;
  mobile_cover_image_url: string;
  is_public: boolean;
}

const defaultForm: EventForm = {
  name: '',
  event_date: '',
  location: '',
  expiration_date: '',
  password: '',
  client_name: '',
  client_email: '',
  client_phone: '',
  description: '',
  cover_image_url: '',
  mobile_cover_image_url: '',
  is_public: false,
};

const BANNER_BUCKET = 'event-media';
const MAX_BANNER_SIZE_MB = 20;
const MAX_BANNER_SIZE_BYTES = MAX_BANNER_SIZE_MB * 1024 * 1024;
const ACCEPTED_BANNER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function parseDescription(value: string | null) {
  if (!value) return { description: '', client_name: '', client_email: '', client_phone: '' };
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        description: parsed.text || '',
        client_name: parsed.client_name || '',
        client_email: parsed.client_email || '',
        client_phone: parsed.client_phone || '',
      };
    }
  } catch {}
  return { description: value, client_name: '', client_email: '', client_phone: '' };
}

function buildDescription(form: EventForm) {
  return JSON.stringify({
    text: form.description,
    client_name: form.client_name,
    client_email: form.client_email,
    client_phone: form.client_phone,
  });
}

type BannerUploaderProps = {
  id: string;
  label: string;
  hint: string;
  previewUrl: string;
  onSelect: (files: FileList | null) => void;
  onRemove: () => void;
};

function BannerUploader({ id, label, hint, previewUrl, onSelect, onRemove }: BannerUploaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label htmlFor={id} className="text-sm font-medium">
            {label}
          </label>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {previewUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Remove ${label}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-orange-50">
        {previewUrl ? (
          <img src={previewUrl} alt={`${label} preview`} className="h-full w-full object-cover" />
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <ImageIcon className="mx-auto mb-2 h-8 w-8 text-orange-700/70" />
            No banner selected
          </div>
        )}
      </div>
      <Input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={(event) => {
          onSelect(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}

export default function PhotographerEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [shareEvent, setShareEvent] = useState<EventRecord | null>(null);
  const [previewEvent, setPreviewEvent] = useState<EventRecord | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [desktopBannerFile, setDesktopBannerFile] = useState<File | null>(null);
  const [mobileBannerFile, setMobileBannerFile] = useState<File | null>(null);
  const [desktopBannerPreview, setDesktopBannerPreview] = useState('');
  const [mobileBannerPreview, setMobileBannerPreview] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    return () => {
      if (desktopBannerPreview.startsWith('blob:')) URL.revokeObjectURL(desktopBannerPreview);
      if (mobileBannerPreview.startsWith('blob:')) URL.revokeObjectURL(mobileBannerPreview);
    };
  }, [desktopBannerPreview, mobileBannerPreview]);

  async function loadEvents() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let query = supabase.from('events').select('*').order('created_at', { ascending: false });
      if (session) query = query.or(`photographer_id.eq.${session.user.id},photographer_id.is.null`);

      const { data, error } = await query;
      if (error) throw error;

      const rawEvents = data || [];
      const eventIds = rawEvents.map((event) => event.id);
      let photosByEvent = new Map<string, { count: number; cover: string | null }>();

      if (eventIds.length > 0) {
        const { data: photosData } = await supabase
          .from('photos')
          .select('event_id, thumbnail_url, url, created_at')
          .in('event_id', eventIds)
          .order('created_at', { ascending: false });

        photosByEvent = (photosData || []).reduce((map, photo) => {
          const current = map.get(photo.event_id) || { count: 0, cover: null };
          map.set(photo.event_id, {
            count: current.count + 1,
            cover: current.cover || photo.thumbnail_url || photo.url || null,
          });
          return map;
        }, new Map<string, { count: number; cover: string | null }>());
      }

      setEvents(rawEvents.map((event) => {
        const photoMeta = photosByEvent.get(event.id);
        const bannerCover = event.cover_image_url || event.mobile_cover_image_url || null;
        return {
          ...event,
          photo_count: photoMeta?.count || 0,
          cover_image_url: bannerCover || photoMeta?.cover || null,
          mobile_cover_image_url: event.mobile_cover_image_url || null,
        };
      }) as EventRecord[]);
    } catch (err: any) {
      toast({ title: 'Unable to load events', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingEvent(null);
    setForm(defaultForm);
    resetBannerFiles();
    setEditOpen(true);
  }

  function openEditDialog(event: EventRecord) {
    const parsed = parseDescription(event.description);
    setEditingEvent(event);
    setForm({
      name: event.name,
      event_date: event.event_date || '',
      location: event.location || '',
      expiration_date: event.expiration_date ? event.expiration_date.slice(0, 10) : '',
      password: event.password || '',
      description: parsed.description,
      client_name: parsed.client_name,
      client_email: parsed.client_email,
      client_phone: parsed.client_phone,
      cover_image_url: event.cover_image_url || '',
      mobile_cover_image_url: event.mobile_cover_image_url || '',
      is_public: event.is_public,
    });
    resetBannerFiles();
    setDesktopBannerPreview(event.cover_image_url || '');
    setMobileBannerPreview(event.mobile_cover_image_url || '');
    setEditOpen(true);
  }

  function resetBannerFiles() {
    if (desktopBannerPreview.startsWith('blob:')) URL.revokeObjectURL(desktopBannerPreview);
    if (mobileBannerPreview.startsWith('blob:')) URL.revokeObjectURL(mobileBannerPreview);
    setDesktopBannerFile(null);
    setMobileBannerFile(null);
    setDesktopBannerPreview('');
    setMobileBannerPreview('');
  }

  function validateBannerFile(file: File) {
    if (!ACCEPTED_BANNER_TYPES.includes(file.type)) {
      return 'Use a PNG, JPG, or WebP image.';
    }
    if (file.size > MAX_BANNER_SIZE_BYTES) {
      return `Banner must be ${MAX_BANNER_SIZE_MB}MB or smaller.`;
    }
    return null;
  }

  function handleBannerSelect(kind: 'desktop' | 'mobile', fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    const validationError = validateBannerFile(file);
    if (validationError) {
      toast({ title: 'Banner not added', description: validationError, variant: 'destructive' });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (kind === 'desktop') {
      if (desktopBannerPreview.startsWith('blob:')) URL.revokeObjectURL(desktopBannerPreview);
      setDesktopBannerFile(file);
      setDesktopBannerPreview(previewUrl);
    } else {
      if (mobileBannerPreview.startsWith('blob:')) URL.revokeObjectURL(mobileBannerPreview);
      setMobileBannerFile(file);
      setMobileBannerPreview(previewUrl);
    }
  }

  function removeBanner(kind: 'desktop' | 'mobile') {
    if (kind === 'desktop') {
      if (desktopBannerPreview.startsWith('blob:')) URL.revokeObjectURL(desktopBannerPreview);
      setDesktopBannerFile(null);
      setDesktopBannerPreview('');
      setForm({ ...form, cover_image_url: '' });
    } else {
      if (mobileBannerPreview.startsWith('blob:')) URL.revokeObjectURL(mobileBannerPreview);
      setMobileBannerFile(null);
      setMobileBannerPreview('');
      setForm({ ...form, mobile_cover_image_url: '' });
    }
  }

  async function uploadBanner(file: File, kind: 'desktop' | 'mobile') {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const storagePath = `event-banners/${Date.now()}-${kind}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const { error } = await supabase.storage
      .from(BANNER_BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: 'Name required', description: 'Please enter an event name.', variant: 'destructive' });
      return;
    }

    setSavingEvent(true);

    try {
      const desktopBannerUrl = desktopBannerFile
        ? await uploadBanner(desktopBannerFile, 'desktop')
        : form.cover_image_url || null;
      const mobileBannerUrl = mobileBannerFile
        ? await uploadBanner(mobileBannerFile, 'mobile')
        : form.mobile_cover_image_url || null;

      const payload = {
      name: form.name,
      event_date: form.event_date || null,
      location: form.location || null,
      expiration_date: form.expiration_date || null,
      password: form.password || null,
      description: buildDescription(form),
      cover_image_url: desktopBannerUrl,
      mobile_cover_image_url: mobileBannerUrl,
      gallery_url: editingEvent?.gallery_url || `event-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      is_public: form.is_public,
      };

      if (editingEvent) {
        const { error } = await supabase.from('events').update(payload).eq('id', editingEvent.id);
        if (error) throw error;
        toast({ title: 'Event updated', description: 'The event details were saved.' });
      } else {
        const { error } = await supabase.from('events').insert([payload]);
        if (error) throw error;
        toast({ title: 'Event created', description: 'Your event has been created.' });
      }

      setEditOpen(false);
      resetBannerFiles();
      loadEvents();
    } catch (err: any) {
      toast({
        title: editingEvent ? 'Update failed' : 'Create failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleDelete(eventId: string) {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Deleted', description: 'Event has been removed.' });
    loadEvents();
  }

  async function handleShare(event: EventRecord) {
    if (!event.is_public) {
      toast({
        title: 'Client delivery is off',
        description: 'Edit the event and activate Client Delivery before sharing access.',
        variant: 'destructive',
      });
      return;
    }

    setShareLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/gallery-access/share', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session?.access_token ? { authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ eventId: event.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to prepare gallery access.');
      setShareEvent(event);
      const url = `${window.location.origin}${payload.sharePath}`;
      setShareUrl(url);
      setShareOpen(true);
      toast({ title: 'Gallery access ready', description: 'Share the QR code or link with your client.' });
    } catch (err: any) {
      toast({ title: 'Share failed', description: err.message, variant: 'destructive' });
    } finally {
      setShareLoading(false);
    }
  }

  function openAddPhotos(eventId: string) {
    router.push(`/dashboard/photographer/upload?eventId=${eventId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Events</h2>
          <p className="text-muted-foreground">Manage event cards, sharing, and client access.</p>
        </div>
        <Button onClick={openCreateDialog}><Plus className="mr-2 h-4 w-4" />Create Event</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border">
              <Skeleton className="aspect-[16/10] rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted p-12 text-center text-muted-foreground">
          No events yet. Create one to start sharing galleries with clients.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={(selectedEvent) => openEditDialog(selectedEvent as EventRecord)}
              onPreview={(selectedEvent) => setPreviewEvent(selectedEvent as EventRecord)}
              onShare={(selectedEvent) => handleShare(selectedEvent as EventRecord)}
              onAddPhotos={openAddPhotos}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
          <DialogHeader className="border-b px-4 py-4 sm:px-6">
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEvent} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Event Name</label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Event Date</label>
                  <Input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Event Location</label>
                  <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Media Expiry Date</label>
                  <Input type="date" value={form.expiration_date} onChange={e => setForm({ ...form, expiration_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Client Name</label>
                  <Input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Client Email</label>
                  <Input type="email" value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Client WhatsApp</label>
                  <Input value={form.client_phone} onChange={e => setForm({ ...form, client_phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Event Password</label>
                  <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
              <label className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox
                  checked={form.is_public}
                  onCheckedChange={(checked) => setForm({ ...form, is_public: checked === true })}
                />
                <span>
                  <span className="block text-sm font-medium">Activate Client Delivery</span>
                  <span className="block text-xs text-muted-foreground">
                    Only activated events can be shared through the client OTP gallery flow.
                  </span>
                </span>
              </label>
              <div>
                <label className="text-sm font-medium mb-1 block">Notes / Description</label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
              </div>
              <div className="space-y-4 rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Banner</h3>
                  <p className="text-sm text-muted-foreground">
                    Optional card preview images. PNG, JPG, or WebP up to {MAX_BANNER_SIZE_MB}MB.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <BannerUploader
                    id="desktop-banner-input"
                    label="Upload Desktop Banner"
                    hint="Recommended 1920x1080px"
                    previewUrl={desktopBannerPreview || form.cover_image_url}
                    onSelect={(files) => handleBannerSelect('desktop', files)}
                    onRemove={() => removeBanner('desktop')}
                  />
                  <BannerUploader
                    id="mobile-banner-input"
                    label="Upload Mobile Banner"
                    hint="Recommended 1080x1920px"
                    previewUrl={mobileBannerPreview || form.mobile_cover_image_url}
                    onSelect={(files) => handleBannerSelect('mobile', files)}
                    onRemove={() => removeBanner('mobile')}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-background px-4 py-3 sm:px-6">
              <Button type="submit" className="w-full md:w-auto" disabled={savingEvent}>
                {savingEvent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {savingEvent ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Share Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code or copy the link to send WhatsApp OTP-protected event access to your client.
            </p>
            <div className="flex justify-center p-4 rounded-xl border border-muted bg-muted/50">
              {shareUrl ? <QRCodeSVG value={shareUrl} size={200} /> : <div className="text-muted-foreground">Preparing QR...</div>}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Share link</p>
              <div className="rounded-lg border bg-background p-3 text-sm break-words">{shareUrl || 'No link available yet.'}</div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Download link</p>
              <div className="rounded-lg border bg-background p-3 text-sm break-words">{shareUrl || 'No link available yet.'}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button className="flex-1" onClick={() => { navigator.clipboard.writeText(shareUrl); toast({ title: 'Copied', description: 'Share link copied to clipboard.' }); }}>
                <Copy className="mr-2 h-4 w-4" />Copy Link
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { navigator.clipboard.writeText(shareUrl); toast({ title: 'Copied', description: 'Download link copied to clipboard.' }); }}>
                <Copy className="mr-2 h-4 w-4" />Copy Download
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => shareUrl && window.open(shareUrl, '_blank')}>
                <Eye className="mr-2 h-4 w-4" />Open
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EventPreviewModal
        event={previewEvent}
        open={Boolean(previewEvent)}
        onOpenChange={(open) => {
          if (!open) setPreviewEvent(null);
        }}
      />
    </div>
  );
}
