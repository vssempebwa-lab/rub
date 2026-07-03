'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Camera, Heart, Star, ArrowRight, Calendar, MapPin, Phone, Mail,
  ChevronRight, Instagram, Facebook, Twitter, Download,
  Eye, Users, Award, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface Testimonial {
  id: string;
  client_name: string;
  client_title: string | null;
  content: string;
  rating: number;
  image_url: string | null;
}

interface Event {
  id: string;
  name: string;
  cover_image_url: string | null;
  event_date: string | null;
  category_id: string | null;
  gallery_url: string | null;
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [bookingForm, setBookingForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    event_date: '',
    event_type: '',
    message: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: catData }, { data: testData }, { data: eventData }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('testimonials').select('*').eq('is_featured', true).order('created_at', { ascending: false }),
      supabase.from('events').select('*').eq('status', 'active').eq('is_public', true).order('created_at', { ascending: false }).limit(6),
    ]);
    if (catData) setCategories(catData);
    if (testData) setTestimonials(testData);
    if (eventData) setFeaturedEvents(eventData);
  }

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('bookings').insert([{
      client_name: bookingForm.client_name,
      client_email: bookingForm.client_email,
      client_phone: bookingForm.client_phone || null,
      event_date: bookingForm.event_date || null,
      event_type: bookingForm.event_type || null,
      message: bookingForm.message || null,
    }]);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Booking Submitted', description: 'We will contact you shortly!' });
      setBookingForm({ client_name: '', client_email: '', client_phone: '', event_date: '', event_type: '', message: '' });
    }
  }

  const bookNowActions = (
    <>
      <Link href="/dashboard/photographer/upload">
        <Button variant="outline" size="sm">Activate Client Delivery</Button>
      </Link>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">Book Now</Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Book a Session</DialogTitle></DialogHeader>
          <form onSubmit={handleBookingSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Your Name" value={bookingForm.client_name} onChange={e => setBookingForm({ ...bookingForm, client_name: e.target.value })} required />
              <Input type="email" placeholder="Email" value={bookingForm.client_email} onChange={e => setBookingForm({ ...bookingForm, client_email: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Phone" value={bookingForm.client_phone} onChange={e => setBookingForm({ ...bookingForm, client_phone: e.target.value })} />
              <Input type="date" value={bookingForm.event_date} onChange={e => setBookingForm({ ...bookingForm, event_date: e.target.value })} />
            </div>
            <Input placeholder="Event Type (Wedding, Portrait, etc.)" value={bookingForm.event_type} onChange={e => setBookingForm({ ...bookingForm, event_type: e.target.value })} />
            <Textarea placeholder="Tell us about your event..." value={bookingForm.message} onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })} />
            <Button type="submit" className="w-full">Submit Booking</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader fixed extraActions={bookNowActions} />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Photography"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">Professional Photography</Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Capturing Life's<br />Beautiful Moments
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Wedding, portrait, graduation, and event photography that tells your unique story with artistry and passion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/portfolio">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold px-8">
                View Portfolio <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8">
                  Book a Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Book a Session</DialogTitle></DialogHeader>
                <form onSubmit={handleBookingSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Your Name" value={bookingForm.client_name} onChange={e => setBookingForm({ ...bookingForm, client_name: e.target.value })} required />
                    <Input type="email" placeholder="Email" value={bookingForm.client_email} onChange={e => setBookingForm({ ...bookingForm, client_email: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Phone" value={bookingForm.client_phone} onChange={e => setBookingForm({ ...bookingForm, client_phone: e.target.value })} />
                    <Input type="date" value={bookingForm.event_date} onChange={e => setBookingForm({ ...bookingForm, event_date: e.target.value })} />
                  </div>
                  <Input placeholder="Event Type" value={bookingForm.event_type} onChange={e => setBookingForm({ ...bookingForm, event_type: e.target.value })} />
                  <Textarea placeholder="Tell us about your event..." value={bookingForm.message} onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })} />
                  <Button type="submit" className="w-full">Submit Booking</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Camera, value: '500+', label: 'Events Covered' },
              { icon: Users, value: '1000+', label: 'Happy Clients' },
              { icon: Award, value: '15+', label: 'Years Experience' },
              { icon: Star, value: '4.9', label: 'Average Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold font-[family-name:var(--font-playfair)]">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From intimate portraits to grand celebrations, we bring expertise and creativity to every shoot.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} href={`/portfolio?category=${cat.slug}`} className="group relative overflow-hidden rounded-xl aspect-[4/5] block">
                <Image
                  src={cat.image_url || `https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=600`}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
                  <p className="text-white/70 text-sm mt-1 line-clamp-2">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services">
              <Button variant="outline">View All Services <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">Latest Projects</h2>
              <p className="text-muted-foreground">Browse our most recent photography work</p>
            </div>
            <Link href="/portfolio" className="hidden md:flex items-center text-sm font-medium text-primary hover:underline">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <Link key={event.id} href={`/gallery/${event.gallery_url || event.id}`} className="group block">
                <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={event.cover_image_url || 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={event.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{event.name}</h3>
                {event.event_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.event_date).toLocaleDateString()}
                  </div>
                )}
              </Link>
            ))}
            {featuredEvents.length === 0 && (
              <>
                {[1,2,3].map((i) => (
                  <div key={i} className="group block">
                    <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-4">
                      <Image
                        src={`https://images.pexels.com/photos/${[2253870, 1024993, 1191710][i-1]}/pexels-photo-${[2253870, 1024993, 1191710][i-1]}.jpeg?auto=compress&cs=tinysrgb&w=800`}
                        alt="Portfolio"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold">Beautiful Wedding Moments</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      Coming Soon
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">What Clients Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Real stories from the people we have had the pleasure of working with</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-card border rounded-xl p-8 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">{t.client_name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.client_name}</div>
                    <div className="text-xs text-muted-foreground">{t.client_title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold mb-6">Ready to Capture Your Story?</h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Let us create timeless memories together. Book your session today and experience photography that goes beyond the ordinary.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                  Book Now <Calendar className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Book a Session</DialogTitle></DialogHeader>
                <form onSubmit={handleBookingSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Your Name" value={bookingForm.client_name} onChange={e => setBookingForm({ ...bookingForm, client_name: e.target.value })} required />
                    <Input type="email" placeholder="Email" value={bookingForm.client_email} onChange={e => setBookingForm({ ...bookingForm, client_email: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Phone" value={bookingForm.client_phone} onChange={e => setBookingForm({ ...bookingForm, client_phone: e.target.value })} />
                    <Input type="date" value={bookingForm.event_date} onChange={e => setBookingForm({ ...bookingForm, event_date: e.target.value })} />
                  </div>
                  <Input placeholder="Event Type" value={bookingForm.event_type} onChange={e => setBookingForm({ ...bookingForm, event_type: e.target.value })} />
                  <Textarea placeholder="Tell us about your event..." value={bookingForm.message} onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })} />
                  <Button type="submit" className="w-full">Submit Booking</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
