'use client';

import { useEffect, useState } from 'react';
import { Camera, CalendarDays } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventPricingTabs } from './event-pricing-tabs';
import { PhotoshootPricingGrid } from './photoshoot-pricing-grid';
import { fetchPublicPricing } from '@/features/website/api/pricing';
import {
  eventPricing as fallbackEventPricing,
  photoshootPricing as fallbackPhotoshootPricing,
  type EventPricingContext,
  type PhotoshootPricingItem,
} from '@/lib/pricing-data';

export function PricingSection() {
  const [eventPricing, setEventPricing] = useState<EventPricingContext[]>([...fallbackEventPricing]);
  const [photoshootPricing, setPhotoshootPricing] = useState<PhotoshootPricingItem[]>([
    ...fallbackPhotoshootPricing,
  ]);

  useEffect(() => {
    fetchPublicPricing().then((pricing) => {
      setEventPricing(pricing.eventPricing);
      setPhotoshootPricing(pricing.photoshootPricing);
    });
  }, []);

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">
            Rub Shoots Photography
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Photography pricing for moments that matter
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            Choose structured full-day event coverage or a focused photoshoot session.
            Events share the Mikolo tier system, while each photoshoot has its own scope.
          </p>
        </div>

        <Tabs defaultValue="events" className="mt-10 w-full">
          <div className="flex justify-center">
            <TabsList className="h-auto rounded-lg bg-stone-100 p-1">
              <TabsTrigger
                value="events"
                className="gap-2 rounded-md px-4 py-2 data-[state=active]:bg-red-700 data-[state=active]:text-white"
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Events
              </TabsTrigger>
              <TabsTrigger
                value="photoshoots"
                className="gap-2 rounded-md px-4 py-2 data-[state=active]:bg-red-700 data-[state=active]:text-white"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                Photoshoots
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="events" className="mt-10">
            <EventPricingTabs eventPricing={eventPricing} />
          </TabsContent>

          <TabsContent value="photoshoots" className="mt-10">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
                Photoshoot Sessions
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Independent session cards with placeholder prices and deliverables ready
                to confirm in the data file.
              </p>
            </div>
            <PhotoshootPricingGrid photoshootPricing={photoshootPricing} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
