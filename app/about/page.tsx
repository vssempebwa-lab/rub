'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingPage } from '@/components/layout/marketing-page';
import { useWebsiteContent } from '@/features/website/hooks/use-website-content';
import { getIcon } from '@/features/website/utils/icon-map';

export default function AboutPage() {
  const { content, team } = useWebsiteContent();
  const { about } = content;

  return (
    <MarketingPage>

      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={about.hero.imageUrl}
            alt="About"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold mb-6">{about.hero.title}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {about.hero.subtitle}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-6">{about.story.title}</h2>
              {about.story.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-muted-foreground mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <div className="grid grid-cols-3 gap-6">
                {about.story.values.map((item, i) => {
                  const ValueIcon = getIcon(item.icon);
                  return (
                    <div key={i} className="text-center">
                      <ValueIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="text-sm font-medium">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src={about.story.imageUrl}
                alt="Our studio"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-card border rounded-xl p-8">
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">{about.mission.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{about.mission.content}</p>
            </div>
            <div className="bg-card border rounded-xl p-8">
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">{about.vision.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{about.vision.content}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4">{about.teamSection.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{about.teamSection.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.id} className="text-center">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 mx-auto max-w-[280px]">
                  <Image
                    src={member.photo_url || member.image_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-6">{about.cta.title}</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {about.cta.subtitle}
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
