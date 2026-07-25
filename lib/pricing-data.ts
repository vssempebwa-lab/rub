export type PricingCategory = 'event' | 'photoshoot';

export type EventTierName = 'Silver' | 'Gold' | 'Platinum';

export type PricingPackage = {
  name: string;
  price: number | null;
  duration: string;
  numberOfPhotographers: string;
  deliverables: string[];
  notes?: string;
  ctaLabel?: string;
};

export type EventPricingTier = PricingPackage & {
  tier: EventTierName;
  isFeatured?: boolean;
};

export type EventPricingContext = {
  id: string;
  name: string;
  category: 'event';
  description: string;
  tiers: readonly EventPricingTier[];
};

export type PhotoshootPricingItem = PricingPackage & {
  id: string;
  category: 'photoshoot';
  shootType: string;
};

export const currencyCode = 'UGX';

export const contactLink = '/contact';

export const eventPackageNote =
  'Full coverage is done on both sides (Bride & Groom). Captured with full-frame cameras and premium lights.';

export const eventPricingTiers: readonly EventPricingTier[] = [
  {
    tier: 'Silver',
    name: 'Silver Package',
    price: 3000000,
    duration: 'Full coverage - 12 hrs',
    numberOfPhotographers: '1 photographer, 2 videographers',
    deliverables: [
      '250 professionally edited photos',
      'Full video coverage',
      'Short cinematic highlight (montage)',
      'Drone coverage',
      'A4 photobook (standard)',
      'Flash disk (full delivery)',
      'Online gallery (sharing & downloads)',
      '2 premium A2 photo boards',
    ],
    notes: eventPackageNote,
  },
  {
    tier: 'Gold',
    name: 'Gold Package',
    price: 4000000,
    duration: 'Full coverage - 15 hrs',
    numberOfPhotographers: '2 photographers, 2 videographers',
    deliverables: [
      '350 professionally edited photos',
      'Full video coverage',
      'Short cinematic highlight (montage)',
      'Drone coverage',
      'A3 photobook (standard)',
      'Hard drive (full delivery)',
      'Online gallery (sharing & downloads)',
      '2 premium A2 photo boards + 4 A3 boards',
    ],
    notes: eventPackageNote,
    isFeatured: true,
  },
  {
    tier: 'Platinum',
    name: 'Platinum Package',
    price: 5500000,
    duration: 'Full day coverage',
    numberOfPhotographers: '2 photographers, 3 videographers',
    deliverables: [
      '500+ professionally edited photos',
      'Full video coverage',
      'Short cinematic highlight (montage)',
      'Drone coverage',
      '3 A3 photobooks (extended)',
      'Hard drive (full delivery)',
      'Online gallery (sharing & downloads)',
      'Premium 2xA3, 2xA2, 1xA1 photo boards',
      'Same-day teaser video',
      'Live stream',
      'Memory lane',
    ],
    notes: eventPackageNote,
  },
];

export const eventPricing: readonly EventPricingContext[] = [
  {
    id: 'introduction',
    name: 'Introduction Ceremony',
    category: 'event',
    description:
      'Traditional ceremony coverage with the shared Mikolo Silver, Gold, and Platinum structure.',
    tiers: eventPricingTiers,
  },
  {
    id: 'wedding',
    name: 'Wedding',
    category: 'event',
    description:
      'Wedding day coverage using the same trusted Mikolo Silver, Gold, and Platinum package structure.',
    tiers: eventPricingTiers,
  },
];

export const photoshootPricing: readonly PhotoshootPricingItem[] = [
  {
    id: 'indoor',
    category: 'photoshoot',
    shootType: 'Indoor Photoshoot',
    name: 'Indoor Studio Session',
    price: null,
    duration: 'TODO: confirm duration',
    numberOfPhotographers: 'TODO: confirm photographers',
    deliverables: [
      'TODO: confirm price',
      'Studio lighting setup',
      'Professionally edited photos',
      'Online gallery for sharing & downloads',
    ],
  },
  {
    id: 'outdoor',
    category: 'photoshoot',
    shootType: 'Outdoor Photoshoot',
    name: 'Outdoor Lifestyle Session',
    price: null,
    duration: 'TODO: confirm duration',
    numberOfPhotographers: 'TODO: confirm photographers',
    deliverables: [
      'TODO: confirm price',
      'Location-based creative direction',
      'Professionally edited photos',
      'Online gallery for sharing & downloads',
    ],
  },
  {
    id: 'family-newborn',
    category: 'photoshoot',
    shootType: 'Portrait - Family & Newborn',
    name: 'Family & Newborn Portraits',
    price: null,
    duration: 'TODO: confirm duration',
    numberOfPhotographers: 'TODO: confirm photographers',
    deliverables: [
      'TODO: confirm price',
      'Gentle guided portrait session',
      'Professionally edited photos',
      'Online gallery for sharing & downloads',
    ],
  },
  {
    id: 'headshots',
    category: 'photoshoot',
    shootType: 'Portrait - Headshots',
    name: 'Professional Headshots',
    price: null,
    duration: 'TODO: confirm duration',
    numberOfPhotographers: 'TODO: confirm photographers',
    deliverables: [
      'TODO: confirm price',
      'Clean portrait lighting',
      'Professionally edited photos',
      'Web and profile-ready image delivery',
    ],
  },
  {
    id: 'boudoir',
    category: 'photoshoot',
    shootType: 'Portrait - Boudoir',
    name: 'Boudoir Portrait Session',
    price: null,
    duration: 'TODO: confirm duration',
    numberOfPhotographers: 'TODO: confirm photographers',
    deliverables: [
      'TODO: confirm price',
      'Private guided portrait session',
      'Professionally edited photos',
      'Secure online gallery delivery',
    ],
  },
  {
    id: 'commercial',
    category: 'photoshoot',
    shootType: 'Commercial Photoshoot',
    name: 'Commercial Brand Session',
    price: null,
    duration: 'TODO: confirm duration',
    numberOfPhotographers: 'TODO: confirm photographers',
    deliverables: [
      'TODO: confirm price',
      'Product, team, or campaign imagery',
      'Professionally edited photos',
      'Usage needs confirmed before booking',
    ],
    notes: 'TODO: confirm usage/licensing terms.',
  },
];
