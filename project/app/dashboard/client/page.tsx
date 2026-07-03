'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Image, Heart, Download, Calendar, ArrowUpRight, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  name: string;
  gallery_url: string | null;
  cover_image_url: string | null;
  status: string;
  event_date: string | null;
}

export default function ClientDashboard() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [
      { data: eventsData },
      { count: favCount },
      { count: dlCount },
    ] = await Promise.all([
      supabase.from('events').select('*').eq('client_id', session.user.id).order('created_at', { ascending: false }),
      supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('client_email', session.user.email),
      supabase.from('downloads').select('*', { count: 'exact', head: true }).eq('downloader_email', session.user.email),
    ]);

    if (eventsData) setMyEvents(eventsData);
    setFavoritesCount(favCount || 0);
    setDownloadsCount(dlCount || 0);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">My Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here is your gallery overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Galleries</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoritesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downloadsCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Galleries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">No galleries assigned yet.</p>
              )}
              {myEvents.map((event) => (
                <Link key={event.id} href={`/gallery/${event.gallery_url || event.id}`} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/50 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {event.cover_image_url ? (
                        <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Image className="h-full w-full p-2 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Link href="/dashboard/client/favorites">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Favorites</h3>
                  <p className="text-sm text-muted-foreground">View all your favorite photos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/client/downloads">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Downloads</h3>
                  <p className="text-sm text-muted-foreground">Access your downloaded photos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/client/bookings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Bookings</h3>
                  <p className="text-sm text-muted-foreground">Track your session bookings</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
