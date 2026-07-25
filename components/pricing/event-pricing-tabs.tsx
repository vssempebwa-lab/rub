'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { eventPricing } from '@/lib/pricing-data';
import { PricingCard } from './pricing-card';

export function EventPricingTabs() {
  return (
    <Tabs defaultValue={eventPricing[0].id} className="w-full">
      <div className="flex justify-center">
        <TabsList className="h-auto flex-wrap rounded-lg bg-stone-100 p-1">
          {eventPricing.map((event) => (
            <TabsTrigger
              key={event.id}
              value={event.id}
              className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-red-700"
            >
              {event.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {eventPricing.map((event) => (
        <TabsContent key={event.id} value={event.id} className="mt-10">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
              {event.name} Packages
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {event.tiers.map((tier) => (
              <PricingCard
                key={`${event.id}-${tier.tier}`}
                packageItem={tier}
                eyebrow={tier.tier}
                featured={tier.isFeatured}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
