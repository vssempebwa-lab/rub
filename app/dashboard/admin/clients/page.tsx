'use client';

import { useEffect, useState } from 'react';
import { Search, Mail, Phone, Trash2, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false });
    if (data) setClients(data);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this client? This will remove their account access.')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Client removed.' });
      loadClients();
    }
  }

  const filtered = clients.filter(c =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Clients</h2>
        <p className="text-muted-foreground">Manage registered clients</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search clients..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-4">
        {filtered.map(client => (
          <Card key={client.id}>
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold text-sm">{(client.full_name || client.email).charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{client.full_name || 'Unnamed'}</h3>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</span>
                    {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Joined {new Date(client.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(client.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4" />
            No clients found.
          </div>
        )}
      </div>
    </div>
  );
}
