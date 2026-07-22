'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Eye, Trash2, Share2, ImagePlus, Copy, QrCode, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface EventRecord {
  id: string;
  name: string;
  event_date: string | null;
  location: string | null;
  gallery_url: string | null;
  qr_code_url: string | null;
  status: string;
  password: string | null;
  expiration_date: string | null;
  is_public: boolean;
  description: string | null;
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
};

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

export default function PhotographerEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [shareEvent, setShareEvent] = useState<EventRecord | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data } = await supabase.from('events').select('*').eq('photographer_id', session.user.id).order('created_at', { ascending: false });
    setEvents(data || []);
    setLoading(false);
  }

  function openCreateDialog() {
    setEditingEvent(null);
    setForm(defaultForm);
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
    });
    setEditOpen(true);
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: 'Name required', description: 'Please enter an event name.', variant: 'destructive' });
      return;
    }

    const payload = {
      name: form.name,
      event_date: form.event_date || null,
      location: form.location || null,
      expiration_date: form.expiration_date || null,
      password: form.password || null,
      description: buildDescription(form),
      gallery_url: editingEvent?.gallery_url || `event-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      is_public: editingEvent?.is_public || false,
    };

    if (editingEvent) {
      const { error } = await supabase.from('events').update(payload).eq('id', editingEvent.id);
      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Event updated', description: 'The event details were saved.' });
    } else {
      const { error } = await supabase.from('events').insert([payload]);
      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Event created', description: 'Your event has been created.' });
    }

    setEditOpen(false);
    loadEvents();
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
    setShareLoading(true);
    try {
      const updates: any = { is_public: true };
      if (!event.gallery_url) {
        updates.gallery_url = `event-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      }
      const { data, error } = await supabase.from('events').update(updates).eq('id', event.id).select().single();
      if (error) throw error;
      const slug = data.gallery_url || data.id;
      setShareEvent(data);
      const url = `${window.location.origin}/gallery/${slug}`;
      setShareUrl(url);
      setShareOpen(true);
      toast({ title: 'Gallery ready', description: 'Share the QR code with your client.' });
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
        <div className="rounded-lg border border-dashed border-muted p-12 text-center text-muted-foreground">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted p-12 text-center text-muted-foreground">
          No events yet. Create one to start sharing galleries with clients.
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const parsed = parseDescription(event.description);
            return (
              <Card key={event.id} className="border shadow-sm">
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{event.is_public ? 'Public' : 'Private'}</span>
                        <span className="text-xs text-muted-foreground">{event.status}</span>
                      </div>
                      <h3 className="text-lg font-semibold">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">{event.location || 'No location set'} • {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                        <Edit className="mr-2 h-4 w-4" />Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/gallery/${event.gallery_url || event.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleShare(event)}>
                        <Share2 className="mr-2 h-4 w-4" />Share
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openAddPhotos(event.id)}>
                        <ImagePlus className="mr-2 h-4 w-4" />Add Photos
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-muted p-4">
                      <p className="text-sm font-medium mb-2">Client Info</p>
                      <p className="text-sm font-semibold">{parsed.client_name || 'Not assigned'}</p>
                      <p className="text-sm text-muted-foreground">{parsed.client_email || 'No email'}</p>
                      <p className="text-sm text-muted-foreground">{parsed.client_phone || 'No WhatsApp'}</p>
                    </div>
                    <div className="rounded-lg border border-muted p-4">
                      <p className="text-sm font-medium mb-2">Access Settings</p>
                      <p className="text-sm">Password required: {event.password ? 'Yes' : 'No'}</p>
                      <p className="text-sm text-muted-foreground break-all">QR link: {event.gallery_url ? `${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/${event.gallery_url}` : 'Not generated'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEvent} className="space-y-4 mt-4">
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
            <div>
              <label className="text-sm font-medium mb-1 block">Notes / Description</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full md:w-auto">
                {editingEvent ? 'Save Changes' : 'Create Event'}
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
            <p className="text-sm text-muted-foreground">Scan this QR code or copy the link to send event access to your client.</p>
            <div className="flex justify-center p-4 rounded-xl border border-muted bg-muted/50">
              {shareUrl ? <QRCodeSVG value={shareUrl} size={200} /> : <div className="text-muted-foreground">Preparing QR...</div>}
            </div>
            <div className="rounded-lg border bg-background p-3 text-sm break-words">{shareUrl || 'No link available yet.'}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button className="flex-1" onClick={() => { navigator.clipboard.writeText(shareUrl); toast({ title: 'Copied', description: 'Share link copied to clipboard.' }); }}>
                <Copy className="mr-2 h-4 w-4" />Copy Link
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => shareUrl && window.open(shareUrl, '_blank')}>
                <Eye className="mr-2 h-4 w-4" />Open Gallery
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
