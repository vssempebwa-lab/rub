'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderOpen, Image, MessageSquare, Calendar, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { UpdateSystemButton } from '../admin/update-system-button';

export default function PhotographerDashboard() {
  const [stats, setStats] = useState({
    myEvents: 0,
    totalPhotos: 0,
    activeGalleries: 0,
    recentEvents: [] as any[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [
        { count: eventsCount },
        { count: photosCount },
        { data: recentEvents },
      ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('photos').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        myEvents: eventsCount || 0,
        totalPhotos: photosCount || 0,
        activeGalleries: recentEvents?.filter(e => e.status === 'active').length || 0,
        recentEvents: recentEvents || [],
      });
    } catch {
      // Fetch failed; dashboard will show empty state
    }
  }

  const statCards = [
    { label: 'My Events', value: stats.myEvents, icon: FolderOpen },
    { label: 'Photos Uploaded', value: stats.totalPhotos, icon: Image },
    { label: 'Active Galleries', value: stats.activeGalleries, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Photographer Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here is your overview.</p>
        </div>
        <UpdateSystemButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">No events assigned yet.</p>
              )}
              {stats.recentEvents.map((event) => (
                <Link key={event.id} href={`/gallery/${event.gallery_url || event.id}`} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/50 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.status} &bull; {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Link href="/dashboard/photographer/upload">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Upload Photos</h3>
                  <p className="text-sm text-muted-foreground">Add photos to your events</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/photographer/events">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Events</h3>
                  <p className="text-sm text-muted-foreground">Create, edit, share, and manage event galleries</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
