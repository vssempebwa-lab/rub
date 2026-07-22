'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, Image, Folder, QrCode, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  gallery_url: string | null;
  cover_image_url: string | null;
  status: string;
  is_public: boolean;
  event_date: string | null;
  location: string | null;
}

export default function AdminGalleriesPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) setEvents(data);
  }

  async function togglePublic(id: string, current: boolean) {
    const { error } = await supabase.from('events').update({ is_public: !current }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: `Gallery is now ${!current ? 'public' : 'private'}` });
      loadEvents();
    }
  }

  function copyLink(url: string | null, id: string) {
    if (!url) return;
    const fullUrl = `${window.location.origin}/gallery/${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast({ title: 'Copied!', description: 'Gallery link copied to clipboard' });
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gallery Manager</h2>
        <p className="text-muted-foreground">Manage client galleries and sharing</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search galleries..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-muted">
              {event.cover_image_url ? (
                <img src={event.cover_image_url} alt={event.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Image className="h-12 w-12" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{event.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className={`px-2 py-0.5 rounded-full ${event.is_public ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {event.is_public ? 'Public' : 'Private'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted">{event.status}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/gallery/${event.gallery_url || event.id}`)}>
                  <Eye className="mr-1 h-3 w-3" /> Preview
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyLink(event.gallery_url, event.id)}>
                  {copiedId === event.id ? <Check className="mr-1 h-3 w-3" /> : <LinkIcon className="mr-1 h-3 w-3" />}
                  {copiedId === event.id ? 'Copied' : 'Copy Link'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => togglePublic(event.id, event.is_public)}>
                  {event.is_public ? 'Make Private' : 'Make Public'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No galleries found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
