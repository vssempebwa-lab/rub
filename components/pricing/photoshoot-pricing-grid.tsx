import type { PhotoshootPricingItem } from '@/lib/pricing-data';
import { PricingCard } from './pricing-card';

export function PhotoshootPricingGrid({
  photoshootPricing,
}: {
  photoshootPricing: PhotoshootPricingItem[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {photoshootPricing.map((shoot) => (
        <PricingCard
          key={shoot.id}
          packageItem={shoot}
          eyebrow={shoot.shootType}
          compact
        />
      ))}
    </div>
  );
}
