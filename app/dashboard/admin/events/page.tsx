'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Calendar, MapPin, MoreHorizontal, Edit, Trash2, Eye, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  client_id: string | null;
  photographer_id: string | null;
  category_id: string | null;
  event_date: string | null;
  location: string | null;
  status: string;
  gallery_url: string | null;
  cover_image_url: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [photographers, setPhotographers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    client_id: '',
    photographer_id: '',
    event_date: '',
    location: '',
    description: '',
    status: 'draft',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: eventsData }, { data: clientsData }, { data: photographersData }] = await Promise.all([
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email').eq('role', 'client'),
      supabase.from('profiles').select('id, full_name, email').eq('role', 'photographer'),
    ]);
    if (eventsData) setEvents(eventsData);
    if (clientsData) setClients(clientsData);
    if (photographersData) setPhotographers(photographersData);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const galleryUrl = `event-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const { data, error } = await supabase.from('events').insert([{
      ...form,
      client_id: form.client_id || null,
      photographer_id: form.photographer_id || null,
      gallery_url: galleryUrl,
    }]).select();
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Event Created', description: 'The event has been created successfully.' });
      setShowCreate(false);
      setForm({ name: '', client_id: '', photographer_id: '', event_date: '', location: '', description: '', status: 'draft' });
      loadData();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Event has been deleted.' });
      loadData();
    }
  }

  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-muted-foreground">Manage all photography events and shoots</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <Input placeholder="Event Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Select value={form.client_id} onValueChange={v => setForm({ ...form, client_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name || c.email}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.photographer_id} onValueChange={v => setForm({ ...form, photographer_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Photographer" /></SelectTrigger>
                  <SelectContent>
                    {photographers.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
                <Input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full">Create Event</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search events..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-muted">
              {event.cover_image_url ? (
                <img src={event.cover_image_url} alt={event.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Calendar className="h-12 w-12" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${event.status === 'active' ? 'bg-emerald-100 text-emerald-700' : event.status === 'draft' ? 'bg-slate-100 text-slate-700' : 'bg-muted text-muted-foreground'}`}>
                  {event.status}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{event.name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                {event.event_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.event_date).toLocaleDateString()}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/gallery/${event.gallery_url || event.id}`)}>
                  <Eye className="mr-1 h-3 w-3" /> View
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/admin/events/${event.id}`)}>
                  <Edit className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events found. Create your first event!</p>
          </div>
        )}
      </div>
    </div>
  );
}
