import { supabase } from '@/lib/supabase';
import {
  eventPricing as fallbackEventPricing,
  photoshootPricing as fallbackPhotoshootPricing,
  type EventPricingContext,
  type EventPricingTier,
  type PhotoshootPricingItem,
} from '@/lib/pricing-data';
import type { PricingPackage as PricingPackageRow } from '@/types';

function toTierName(tier: string): EventPricingTier['tier'] {
  if (tier === 'gold') return 'Gold';
  if (tier === 'premium' || tier === 'platinum') return 'Platinum';
  return 'Silver';
}

function toEventTier(pkg: PricingPackageRow): EventPricingTier {
  return {
    tier: toTierName(pkg.tier),
    name: pkg.name,
    price: pkg.price,
    duration: pkg.duration || 'Coverage details to confirm',
    numberOfPhotographers: pkg.number_of_photographers || 'Team size to confirm',
    deliverables: pkg.features ?? [],
    notes: pkg.notes ?? undefined,
    ctaLabel: pkg.cta_label ?? undefined,
    isFeatured: pkg.is_popular,
  };
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function fetchPublicPricing(): Promise<{
  eventPricing: EventPricingContext[];
  photoshootPricing: PhotoshootPricingItem[];
}> {
  const { data, error } = await supabase
    .from('pricing_packages')
    .select('*')
    .order('sort_order');

  if (error || !data?.length) {
    return {
      eventPricing: [...fallbackEventPricing],
      photoshootPricing: [...fallbackPhotoshootPricing],
    };
  }

  const rows = data as PricingPackageRow[];
  const eventGroups = rows.filter((pkg) => pkg.category !== 'Photoshoots');
  const photoshoots = rows.filter((pkg) => pkg.category === 'Photoshoots');
  const grouped = new Map<string, PricingPackageRow[]>();

  for (const pkg of eventGroups) {
    const category = pkg.category || 'Events';
    grouped.set(category, [...(grouped.get(category) ?? []), pkg]);
  }

  return {
    eventPricing: Array.from(grouped.entries()).map(([category, packages]) => ({
      id: slugify(category),
      name: category,
      category: 'event',
      description: `${category} coverage packages managed from Site Customization.`,
      tiers: packages.map(toEventTier),
    })),
    photoshootPricing: photoshoots.map((pkg) => ({
      id: pkg.id,
      category: 'photoshoot',
      shootType: pkg.description || pkg.category,
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration || 'To confirm',
      numberOfPhotographers: pkg.number_of_photographers || 'To confirm',
      deliverables: pkg.features ?? [],
      notes: pkg.notes ?? undefined,
      ctaLabel: pkg.cta_label ?? undefined,
    })),
  };
}
