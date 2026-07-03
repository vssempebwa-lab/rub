'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Users, Image, FolderOpen, TrendingUp, DollarSign,
  ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalClients: 0,
    totalPhotos: 0,
    pendingBookings: 0,
    totalDownloads: 0,
    recentBookings: [] as any[],
    recentEvents: [] as any[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [
      { count: eventsCount },
      { count: clientsCount },
      { count: photosCount },
      { count: bookingsCount },
      { count: downloadsCount },
      { data: recentBookings },
      { data: recentEvents },
    ] = await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
      supabase.from('photos').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('downloads').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('events').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      totalEvents: eventsCount || 0,
      totalClients: clientsCount || 0,
      totalPhotos: photosCount || 0,
      pendingBookings: bookingsCount || 0,
      totalDownloads: downloadsCount || 0,
      recentBookings: recentBookings || [],
      recentEvents: recentEvents || [],
    });
  }

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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentBookings.length === 0 && (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              )}
              {stats.recentBookings.map((booking) => (
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
            <CardTitle className="text-lg">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">No events created yet.</p>
              )}
              {stats.recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.location || 'No location'} &bull; {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${event.status === 'active' ? 'bg-emerald-100 text-emerald-700' : event.status === 'draft' ? 'bg-slate-100 text-slate-700' : 'bg-muted text-muted-foreground'}`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/admin/events" className="text-sm text-primary hover:underline mt-4 inline-block">
              View all events
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/admin/events">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Create Event</h3>
                <p className="text-sm text-muted-foreground">Set up a new photo shoot</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/admin/bookings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Bookings</h3>
                <p className="text-sm text-muted-foreground">Review and confirm bookings</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/admin/galleries">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Image className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">Gallery Manager</h3>
                <p className="text-sm text-muted-foreground">Organize and manage galleries</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
