'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Grid3X3, LayoutList, X, Menu, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  name: string;
  cover_image_url: string | null;
  event_date: string | null;
  location: string | null;
  gallery_url: string | null;
  category_id: string | null;
  status: string;
  is_public: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function PortfolioPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: catData }, { data: eventData }] = await Promise.all([
      supabase.from('categories').select('id, name, slug').order('sort_order'),
      supabase.from('events').select('*').eq('status', 'active').eq('is_public', true).order('created_at', { ascending: false }),
    ]);
    if (catData) setCategories(catData);
    if (eventData) setEvents(eventData);
  }

  const filteredEvents = activeCategory === 'all'
    ? events
    : events.filter(e => {
        const cat = categories.find(c => c.id === e.category_id);
        return cat?.slug === activeCategory;
      });

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              <span className="font-[family-name:var(--font-playfair)] text-xl font-bold">Rub Shoots</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            </div>
            <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Portfolio"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">Our Work</Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold mb-6">Portfolio</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Explore our collection of weddings, portraits, events, and more.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.slug ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-muted'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-muted'}`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Link key={event.id} href={`/gallery/${event.gallery_url || event.id}`} className="group block">
                  <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-4">
                    <Image
                      src={event.cover_image_url || 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={event.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium flex items-center gap-2">
                        View Gallery <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{event.name}</h3>
                  {event.event_date && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <Link key={event.id} href={`/gallery/${event.gallery_url || event.id}`} className="group flex flex-col md:flex-row gap-6 bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-[16/9] md:aspect-[3/2] md:w-80 flex-shrink-0 overflow-hidden">
                    <Image
                      src={event.cover_image_url || 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={event.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">{event.name}</h3>
                    {event.location && <p className="text-sm text-muted-foreground mb-1">{event.location}</p>}
                    {event.event_date && <p className="text-sm text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>}
                    <div className="mt-4">
                      <span className="text-sm text-primary font-medium flex items-center gap-1">
                        View Gallery <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No galleries available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="h-6 w-6 text-primary" />
            <span className="font-[family-name:var(--font-playfair)] text-xl font-bold">Rub Shoots</span>
          </div>
          <p className="text-sm text-muted-foreground"> Rub Shoots Photography. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
