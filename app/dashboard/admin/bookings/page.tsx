'use client';

import { useEffect, useState } from 'react';
import { Search, Check, X, Clock, Mail, Phone, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  event_date: string | null;
  event_type: string | null;
  package_name: string | null;
  message: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (data) setBookings(data);
    } catch {
      // Leave state at defaults on error
    }
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: `Booking status changed to ${status}` });
      loadBookings();
    }
  }

  const filtered = bookings.filter(b => {
    const matchesSearch = b.client_name.toLowerCase().includes(search.toLowerCase()) ||
      b.client_email.toLowerCase().includes(search.toLowerCase()) ||
      (b.event_type || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      confirmed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    return <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || 'bg-muted'}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bookings</h2>
        <p className="text-muted-foreground">Manage client bookings and inquiries</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bookings..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{booking.client_name}</h3>
                    {statusBadge(booking.status)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      {booking.client_email}
                    </div>
                    {booking.client_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {booking.client_phone}
                      </div>
                    )}
                    {booking.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(booking.event_date).toLocaleDateString()}
                      </div>
                    )}
                    {booking.event_type && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {booking.event_type}
                      </div>
                    )}
                  </div>
                  {booking.message && (
                    <p className="text-sm text-muted-foreground mt-2 italic">&ldquo;{booking.message}&rdquo;</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(booking.id, 'confirmed')}>
                        <Check className="mr-1 h-3 w-3" /> Confirm
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, 'cancelled')}>
                        <X className="mr-1 h-3 w-3" /> Decline
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, 'completed')}>
                      <Check className="mr-1 h-3 w-3" /> Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
