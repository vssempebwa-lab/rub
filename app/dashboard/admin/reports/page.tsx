'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Calendar, Users, Image, ImageOff, Download, Camera, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalEvents: number;
  totalClients: number;
  totalPhotographers: number;
  totalPhotos: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalDownloads: number;
  publicGalleries: number;
  privateGalleries: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalClients: 0,
    totalPhotographers: 0,
    totalPhotos: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalDownloads: 0,
    publicGalleries: 0,
    privateGalleries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const [
        { count: eventsCount },
        { count: clientsCount },
        { count: photographersCount },
        { count: photosCount },
        { count: pendingBookings },
        { count: confirmedBookings },
        { count: downloadsCount },
        { data: galleriesData },
      ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'photographer'),
        supabase.from('photos').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('downloads').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('is_public'),
      ]);

      const publicGalleries = galleriesData?.filter(e => e.is_public).length || 0;
      const privateGalleries = (galleriesData?.length || 0) - publicGalleries;

      setStats({
        totalEvents: eventsCount || 0,
        totalClients: clientsCount || 0,
        totalPhotographers: photographersCount || 0,
        totalPhotos: photosCount || 0,
        pendingBookings: pendingBookings || 0,
        confirmedBookings: confirmedBookings || 0,
        totalDownloads: downloadsCount || 0,
        publicGalleries,
        privateGalleries,
      });
    } catch {
      // Leave stats at defaults on error
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, icon: Calendar },
    { label: 'Clients', value: stats.totalClients, icon: Users },
    { label: 'Photographers', value: stats.totalPhotographers, icon: Camera },
    { label: 'Photos', value: stats.totalPhotos, icon: Image },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: TrendingUp },
    { label: 'Confirmed Bookings', value: stats.confirmedBookings, icon: Calendar },
    { label: 'Downloads', value: stats.totalDownloads, icon: Download },
    { label: 'Public Galleries', value: stats.publicGalleries, icon: Image },
    { label: 'Private Galleries', value: stats.privateGalleries, icon: ImageOff },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-muted-foreground">Overview of your photography business</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
