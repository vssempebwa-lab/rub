'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

type BookSessionDialogProps = {
  trigger?: React.ReactNode;
};

export function BookSessionDialog({ trigger }: BookSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    event_date: '',
    event_type: '',
    message: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('bookings').insert([{
      client_name: form.client_name,
      client_email: form.client_email,
      client_phone: form.client_phone || null,
      event_date: form.event_date || null,
      event_type: form.event_type || null,
      message: form.message || null,
    }]);

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Booking submitted', description: 'We will contact you shortly!' });
    setForm({ client_name: '', client_email: '', client_phone: '', event_date: '', event_type: '', message: '' });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm">Book a session</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Book a photography session</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Tell us about your event and we&apos;ll get back to you within 24 hours.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Your name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required />
            <Input type="email" placeholder="Email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Phone" value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} />
            <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
          </div>
          <Input placeholder="Event type (Wedding, Portrait, etc.)" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} />
          <Textarea placeholder="Tell us about your event..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit booking request'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
