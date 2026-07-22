'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, Check, Star, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Package {
  id: string;
  name: string;
  tier: string;
  price: number | null;
  description: string | null;
  features: string[] | null;
  is_popular: boolean;
  category: 'Wedding' | 'Introduction';
}

const packageCategories = [
  {
    title: 'EVENTS',
    subtitle: 'Wedding package',
    packages: [
      {
        id: 'wedding-silver',
        name: 'Silver',
        tier: 'silver',
        price: 3000000,
        description: 'Premium wedding coverage with essential storytelling assets.',
        features: [
          '1 Photographer • 2 Videographers',
          'Full coverage • 12 hours',
          '250 professionally edited photos',
          'Full video coverage + short cinematic highlight',
          'Drone coverage',
          'A4 photobook (standard)',
          'Flash disk delivery',
          'Online client gallery',
          '2 premium A2 photo boards',
        ],
        is_popular: false,
        category: 'Wedding',
      },
      {
        id: 'wedding-gold',
        name: 'Gold',
        tier: 'gold',
        price: 4000000,
        description: 'Extended coverage with upgraded albums, boards and delivery assets.',
        features: [
          '2 Photographers • 2 Videographers',
          'Full coverage • 15 hours',
          '350 professionally edited photos',
          'Short cinematic highlight',
          'Drone coverage',
          'A3 photobook (standard)',
          'Hard drive delivery',
          'Online client gallery',
          '2 premium A2 photo boards • 4 A3 presentation boards',
        ],
        is_popular: true,
        category: 'Wedding',
      },
      {
        id: 'wedding-platinum',
        name: 'Platinum',
        tier: 'premium',
        price: 5500000,
        description: 'The ultimate wedding experience with cinematic video and premium presentation.',
        features: [
          '2 Photographers • 3 Videographers',
          'Full-day coverage',
          '500+ professionally edited photos',
          'Full video coverage + highlight montage',
          'Drone coverage',
          '3 A3 photobooks (extended)',
          'Hard drive delivery',
          'Online client gallery',
          'Premium boards: 2 A3, 2 A2, 1 A1',
          'Same-day teaser video • Live stream • Memory lane showcase',
        ],
        is_popular: false,
        category: 'Wedding',
      },
    ],
  },
  {
    title: 'Introduction Packages',
    subtitle: '',
    packages: [
      {
        id: 'intro-silver',
        name: 'Silver',
        tier: 'silver',
        price: 3000000,
        description: 'Premium wedding coverage adapted for introduction campaigns.',
        features: [
          '1 Photographer • 2 Videographers',
          'Full coverage • 12 hours',
          '250 professionally edited photos',
          'Full video coverage + short cinematic highlight',
          'Drone coverage',
          'A4 photobook (standard)',
          'Flash disk delivery',
          'Online client gallery',
          '2 premium A2 photo boards',
        ],
        is_popular: false,
        category: 'Introduction',
      },
      {
        id: 'intro-gold',
        name: 'Gold',
        tier: 'gold',
        price: 4000000,
        description: 'Extended introduction package with premium presentation and full media delivery.',
        features: [
          '2 Photographers • 2 Videographers',
          'Full coverage • 15 hours',
          '350 professionally edited photos',
          'Short cinematic highlight',
          'Drone coverage',
          'A3 photobook (standard)',
          'Hard drive delivery',
          'Online client gallery',
          '2 premium A2 photo boards • 4 A3 presentation boards',
        ],
        is_popular: true,
        category: 'Introduction',
      },
      {
        id: 'intro-platinum',
        name: 'Platinum',
        tier: 'premium',
        price: 5500000,
        description: 'Ultimate introduction package with cinematic storytelling and premium delivery.',
        features: [
          '2 Photographers • 3 Videographers',
          'Full-day coverage',
          '500+ professionally edited photos',
          'Full video coverage + highlight montage',
          'Drone coverage',
          '3 A3 photobooks (extended)',
          'Hard drive delivery',
          'Online client gallery',
          'Premium boards: 2 A3, 2 A2, 1 A1',
          'Same-day teaser video • Live stream • Memory lane showcase',
        ],
        is_popular: false,
        category: 'Introduction',
      },
    ],
  },
];

export default function PricingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    event_date: '',
    event_type: '',
    package_name: '',
    message: '',
  });

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('bookings').insert([{
      client_name: bookingForm.client_name,
      client_email: bookingForm.client_email,
      client_phone: bookingForm.client_phone || null,
      event_date: bookingForm.event_date || null,
      event_type: bookingForm.event_type || null,
      package_name: bookingForm.package_name || null,
      message: bookingForm.message || null,
    }]);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Booking Submitted', description: 'We will contact you shortly!' });
      setBookingForm({ client_name: '', client_email: '', client_phone: '', event_date: '', event_type: '', package_name: '', message: '' });
    }
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ];

  const tierColors: Record<string, string> = {
    silver: 'border-slate-300',
    gold: 'border-amber-400',
    premium: 'border-primary',
    custom: 'border-muted-foreground',
  };

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
      <section className="py-20 lg:py-28 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-6">Transparent Pricing</Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold mb-6">Investment in Memories</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the package that fits your needs. Every package includes our signature quality and attention to detail.
          </p>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {packageCategories.map((category) => (
            <div key={category.title} className="space-y-10">
              <div className="text-center max-w-3xl mx-auto">
                {category.title ? (
                  <>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                      {category.title}
                    </span>
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mt-6">{category.title}</h2>
                  </>
                ) : null}
                <p className="text-lg text-black font-bold uppercase mt-4">{category.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {category.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative bg-white border-2 rounded-3xl p-8 shadow-xl transition-transform duration-300 hover:-translate-y-1 ${tierColors[pkg.tier] || 'border-border'}`}
                  >
                    {pkg.is_popular && (
                      <div className="absolute -top-4 left-4">
                        <Badge className="bg-primary text-white px-4 py-1 shadow-lg">Most Popular</Badge>
                      </div>
                    )}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                        <span className={`h-2.5 w-2.5 rounded-full ${pkg.tier === 'silver' ? 'bg-slate-400' : pkg.tier === 'gold' ? 'bg-amber-400' : 'bg-primary'}`} />
                        {pkg.name}
                      </div>
                      <h3 className="mt-4 text-2xl font-[family-name:var(--font-playfair)] font-bold">{pkg.name} Package</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p>
                    </div>
                    <div className="mb-8">
                      <div className="text-sm text-muted-foreground">Starting from</div>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-3xl font-bold">UGX {pkg.price?.toLocaleString()}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8 text-sm text-muted-foreground">
                      {pkg.features?.map((feat, i) => (
                        <li key={i} className="flex gap-3">
                          <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          variant={pkg.is_popular ? 'default' : 'outline'}
                          onClick={() => setBookingForm({ ...bookingForm, package_name: `${category.title} - ${pkg.name}` })}
                        >
                          Book {pkg.name}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Book {pkg.name} Package</DialogTitle></DialogHeader>
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
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ / Info */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">Common Questions</h2>
          </div>
          <div className="space-y-6">
            {[
              { q: 'How far in advance should I book?', a: 'We recommend booking at least 3-6 months in advance for weddings and 1-2 months for other events to ensure availability.' },
              { q: 'What is included in the edited photos?', a: 'All edited photos include color correction, exposure adjustment, cropping, and basic retouching. Advanced retouching is available upon request.' },
              { q: 'How long until I receive my photos?', a: 'Turnaround time is typically 2-4 weeks for standard packages and 1-2 weeks for premium packages.' },
              { q: 'Can I customize a package?', a: 'Absolutely! Our Custom package is designed for clients who want a tailored experience. Contact us to discuss your needs.' },
            ].map((faq, i) => (
              <div key={i} className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
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
