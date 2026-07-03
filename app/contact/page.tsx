'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, Phone, Mail, MapPin, Clock, Instagram, Facebook, Twitter, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MarketingPage } from '@/components/layout/marketing-page';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    message: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('bookings').insert([{
      client_name: form.client_name,
      client_email: form.client_email,
      client_phone: form.client_phone || null,
      message: form.message || null,
    }]);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Message Sent', description: 'We will get back to you soon!' });
      setForm({ client_name: '', client_email: '', client_phone: '', message: '' });
    }
  }

  return (
    <MarketingPage>

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold mb-6">Get In Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question or ready to book? We would love to hear from you. Reach out and let us start a conversation.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-8">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-muted-foreground text-sm">+233 20 123 4567</p>
                    <p className="text-muted-foreground text-sm">+233 24 987 6543</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground text-sm">hello@rubshoots.com</p>
                    <p className="text-muted-foreground text-sm">bookings@rubshoots.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-muted-foreground text-sm">12 Independence Avenue</p>
                    <p className="text-muted-foreground text-sm">Accra, Ghana</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground text-sm">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground text-sm">Sunday: By appointment</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a href="#" className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card border rounded-xl p-8">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Name</label>
                    <Input placeholder="Your name" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <Input type="email" placeholder="your@email.com" value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <Input placeholder="+233..." value={form.client_phone} onChange={e => setForm({ ...form, client_phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea placeholder="Tell us about your event or inquiry..." rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-0">
        <div className="h-80 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">12 Independence Avenue, Accra, Ghana</p>
            <p className="text-sm text-muted-foreground mt-1">Interactive map would be displayed here</p>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
