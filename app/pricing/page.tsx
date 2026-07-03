'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Star, ArrowRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MarketingPage } from '@/components/layout/marketing-page';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useWebsiteContent } from '@/features/website/hooks/use-website-content';

interface Package {
  id: string;
  name: string;
  tier: string;
  price: number | null;
  description: string | null;
  features: string[] | null;
  is_popular: boolean;
}

export default function PricingPage() {
  const { content, business, faqs } = useWebsiteContent();
  const { pricing } = content;
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookingForm, setBookingForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    event_date: '',
    event_type: '',
    package_name: '',
    message: '',
  });

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    const { data } = await supabase.from('pricing_packages').select('*').order('sort_order');
    if (data) setPackages(data);
  }

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

  const tierColors: Record<string, string> = {
    silver: 'border-slate-300',
    gold: 'border-amber-400',
    premium: 'border-primary',
    custom: 'border-muted-foreground',
  };

  return (
    <MarketingPage>

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-6">{pricing.hero.badge}</Badge>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold mb-6">{pricing.hero.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {pricing.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-card border-2 rounded-xl p-8 flex flex-col ${tierColors[pkg.tier] || 'border-border'} ${pkg.is_popular ? 'shadow-lg scale-105' : ''}`}
              >
                {pkg.is_popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1 fill-current" /> Most Popular
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                </div>
                <div className="mb-6">
                  {pkg.price ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-muted-foreground">{business.currencyCode}</span>
                      <span className="text-4xl font-bold">{pkg.price.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">Custom Quote</div>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features?.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      variant={pkg.is_popular ? 'default' : 'outline'}
                      onClick={() => setBookingForm({ ...bookingForm, package_name: pkg.name })}
                    >
                      Book Now <ArrowRight className="ml-2 h-4 w-4" />
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
      </section>

      {/* FAQ / Info */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">{pricing.faqTitle}</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
