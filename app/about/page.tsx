'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Camera, Award, Heart, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingPage } from '@/components/layout/marketing-page';

export default function AboutPage() {
  return (
    <MarketingPage>

      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="About Rub Shoots"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold mb-6">Our Story</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Two decades of capturing joy, love, and life&apos;s most precious moments across Ghana and beyond.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-6">Passion Meets Precision</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Founded in 2008, Rub Shoots Photography began as a small studio in Accra with a simple mission: to capture authentic moments that families and couples would treasure forever.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                What started as a one-person operation has grown into a full-service photography company with a team of talented photographers, editors, and creative professionals.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We believe every moment deserves to be remembered. From the nervous excitement before a wedding to the proud smiles at graduation, we are there to preserve it all.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: Heart, label: 'Passion Driven' },
                  { icon: Award, label: 'Award Winning' },
                  { icon: Users, label: 'Client First' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-sm font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Our studio"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-card border rounded-xl p-8">
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To provide exceptional photography services that capture the essence of every moment, delivering images that evoke emotion and preserve memories for generations. We strive to make every client feel comfortable and confident in front of the camera.
              </p>
            </div>
            <div className="bg-card border rounded-xl p-8">
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be the most trusted and sought-after photography studio in West Africa, known for our artistry, professionalism, and innovative approach to visual storytelling. We aim to set the standard for excellence in the photography industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">Meet the Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Talented professionals dedicated to capturing your perfect moments</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Ruben Mensah', role: 'Founder & Lead Photographer', img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Ama Darko', role: 'Senior Photographer', img: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Kofi Asante', role: 'Event Photographer', img: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400' },
            ].map((member, i) => (
              <div key={i} className="text-center">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 mx-auto max-w-[280px]">
                  <Image src={member.img} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-6">Let Us Tell Your Story</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Every story is unique. We would love to hear yours and create something beautiful together.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
              Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingPage>
  );
}
