'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, ArrowRight, Check, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface Service {
  id: string;
  name: string;
  description: string | null;
  features: string[] | null;
  starting_price: number | null;
  image_url: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: catData }, { data: svcData }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('services').select('*').order('sort_order'),
    ]);
    if (catData) setCategories(catData);
    if (svcData) setServices(svcData);
  }

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(s => s.category_id === activeCategory);

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
            src="https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Services"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">What We Offer</Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold mb-6">Our Services</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Comprehensive photography solutions tailored to capture every special moment in your life.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
            >
              All Services
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-card border rounded-xl overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={service.image_url || 'https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.description}</p>
                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {service.features.slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-primary" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t">
                    {service.starting_price && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">From </span>
                        <span className="font-semibold">GHS {service.starting_price.toLocaleString()}</span>
                      </div>
                    )}
                    <Link href="/pricing">
                      <Button variant="ghost" size="sm" className="text-primary">
                        Learn More <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {filteredServices.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-muted-foreground">No services found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Simple steps to your perfect photos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Book', desc: 'Choose your package and schedule your session' },
              { step: '02', title: 'Shoot', desc: 'Our team captures your special moments' },
              { step: '03', title: 'Review', desc: 'Preview and select your favorite images' },
              { step: '04', title: 'Deliver', desc: 'Receive your edited photos in high resolution' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-primary/20 font-[family-name:var(--font-playfair)] mb-4">{item.step}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
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
