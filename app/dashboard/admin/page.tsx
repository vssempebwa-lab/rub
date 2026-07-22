'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Users, Image, FolderOpen,
  ArrowUpRight, Clock, Globe, Plus, Search,
  Edit, Trash2, Upload, Share2, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  event_date: string | null;
  location: string | null;
  status: string;
  gallery_url: string | null;
  cover_image_url: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  client_name: string;
  event_type: string | null;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalClients: 0,
    totalPhotos: 0,
    pendingBookings: 0,
    totalDownloads: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventSearch, setEventSearch] = useState('');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '',
    event_date: '',
    location: '',
    description: '',
    status: 'draft',
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [
        { count: eventsCount },
        { count: clientsCount },
        { count: photosCount },
        { count: bookingsCount },
        { count: downloadsCount },
        { data: recentBookingsData },
        { data: eventsData },
      ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('photos').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('downloads').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('events').select('*').order('created_at', { ascending: false }).limit(8),
      ]);

      setStats({
        totalEvents: eventsCount || 0,
        totalClients: clientsCount || 0,
        totalPhotos: photosCount || 0,
        pendingBookings: bookingsCount || 0,
        totalDownloads: downloadsCount || 0,
      });
      setRecentBookings(recentBookingsData || []);
      setEvents(eventsData || []);
    } catch {
      // Leave state at defaults on error
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    const galleryUrl = `event-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const { error } = await supabase.from('events').insert([{
      ...eventForm,
      gallery_url: galleryUrl,
    }]);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Event Created', description: 'The event has been created successfully.' });
      setShowCreateEvent(false);
      setEventForm({ name: '', event_date: '', location: '', description: '', status: 'draft' });
      loadDashboard();
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Event has been deleted.' });
      loadDashboard();
    }
  }

  function copyEventLink(galleryUrl: string | null, eventId: string) {
    if (!galleryUrl) return;
    const url = `${window.location.origin}/gallery/${galleryUrl}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'Share link copied to clipboard' });
  }

  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.location?.toLowerCase().includes(eventSearch.toLowerCase())
  );

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, icon: FolderOpen, trend: '+12%' },
    { label: 'Clients', value: stats.totalClients, icon: Users, trend: '+8%' },
    { label: 'Photos', value: stats.totalPhotos, icon: Image, trend: '+24%' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: Calendar, trend: 'active' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {stat.trend === 'active' ? (
                  <><Clock className="h-3 w-3" /> Requires attention</>
                ) : (
                  <><ArrowUpRight className="h-3 w-3 text-emerald-500" /> {stat.trend} from last month</>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events Module */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Events</CardTitle>
            <p className="text-sm text-muted-foreground">Create, share, and manage photo events</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search events..." className="pl-9 h-9 w-full sm:w-64" value={eventSearch} onChange={e => setEventSearch(e.target.value)} />
            </div>
            <Button size="sm" onClick={() => setShowCreateEvent(true)}><Plus className="mr-2 h-4 w-4" /> New Event</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No events yet. Create your first event!</p>
            )}
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                    {event.cover_image_url ? (
                      <img src={event.cover_image_url} alt={event.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Calendar className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{event.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {event.event_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(event.event_date).toLocaleDateString()}</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-0 sm:ml-auto">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${event.status === 'active' ? 'bg-emerald-100 text-emerald-700' : event.status === 'draft' ? 'bg-slate-100 text-slate-700' : 'bg-muted text-muted-foreground'}`}>
                    {event.status}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => copyEventLink(event.gallery_url, event.id)} disabled={!event.gallery_url}>
                    <Share2 className="mr-1 h-3 w-3" /> Share
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/admin/events/${event.id}/gallery`}>
                      <Upload className="mr-1 h-3 w-3" /> Photos
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/admin/events/${event.id}`}>
                      <Edit className="mr-1 h-3 w-3" /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDeleteEvent(event.id)}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredEvents.length > 0 && (
              <div className="text-center pt-2">
                <Link href="/dashboard/admin/events" className="text-sm text-primary hover:underline">View all events</Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length === 0 && (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              )}
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{booking.client_name}</p>
                    <p className="text-xs text-muted-foreground">{booking.event_type || 'General'} &bull; {new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/admin/bookings" className="text-sm text-primary hover:underline mt-4 inline-block">
              View all bookings
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/dashboard/admin/website">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-dashed">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <Globe className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Edit Website</h3>
                      <p className="text-xs text-muted-foreground">Manage public content</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/dashboard/admin/galleries">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-dashed">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <Image className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Gallery Manager</h3>
                      <p className="text-xs text-muted-foreground">Organize galleries</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/dashboard/admin/clients">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-dashed">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Manage Clients</h3>
                      <p className="text-xs text-muted-foreground">View client profiles</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/dashboard/admin/photographers">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-dashed">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Photographers</h3>
                      <p className="text-xs text-muted-foreground">Manage team</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateEvent} className="space-y-4 mt-4">
            <Input placeholder="Event Name" value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <Input type="date" value={eventForm.event_date} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })} />
              <Input placeholder="Location" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} />
            </div>
            <Textarea placeholder="Description" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
            <Select value={eventForm.status} onValueChange={v => setEventForm({ ...eventForm, status: v })}>
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
  );
}
